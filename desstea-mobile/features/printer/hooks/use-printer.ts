import { Alert, PermissionsAndroid, Platform } from "react-native";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import {
  BLEPrinter,
  PrinterWidth,
} from "react-native-thermal-receipt-printer-image-qr";
import { OrderItem } from "../../../store";
import { getItemPrice } from "../../pos/types";
import { useBranchName } from "../../auth/hooks/use-branch-name";

export type ReceiptDetails = {
  customerName: string;
  paymentMethod: "Cash" | "GCash";
  items: OrderItem[];
  total: number;
  cashTendered?: number;
  change?: number;
  completedAt?: Date;
  orderRef?: string;
};

async function getLogoBase64(): Promise<string | null> {
  try {
    const asset = Asset.fromModule(
      require("../../../assets/images/logo-padding.png"),
    );
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (!uri) return null;
    const file = new File(uri);
    return await file.base64();
  } catch (e) {
    console.warn("getLogoBase64 failed:", e);
    return null;
  }
}

async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== "android" || Platform.Version < 31) return true;
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  ]);
  return (
    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === "granted" &&
    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === "granted"
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

export function usePrinter() {
  const { branchName } = useBranchName();

  const printTestMessage = async () => {
    try {
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Permission Denied",
          "Bluetooth permission is required to print.",
        );
        return;
      }
      await BLEPrinter.init();

      const devices: { device_name: string; inner_mac_address: string }[] =
        await BLEPrinter.getDeviceList();

      if (!devices || devices.length === 0) {
        Alert.alert(
          "No Printers",
          "No paired Bluetooth printers found.\n\nPair Kprinter_8caa in Bluetooth settings first.",
        );
        return;
      }

      const printer = devices.find(
        (d) => d.device_name?.toLowerCase() === "kprinter_8caa",
      );

      if (!printer) {
        Alert.alert(
          "Printer not found",
          `Paired devices: ${devices.map((d) => d.device_name).join(", ") || "none"}\n\nPair Kprinter_8caa in Bluetooth settings first.`,
        );
        return;
      }

      // Close any stale connection before reconnecting
      try {
        await BLEPrinter.closeConn();
      } catch {
        // ignore — no prior connection to close
      }

      await withTimeout(
        BLEPrinter.connectPrinter(printer.inner_mac_address),
        5000,
        "Printer connection",
      );

      // Small delay to let the Bluetooth socket fully establish
      await new Promise((r) => setTimeout(r, 300));

      BLEPrinter.printText("Working\n\n\n", {});
    } catch (err: unknown) {
      Alert.alert(
        "Print Error",
        `Could not print. Make sure the printer is powered on and in range.\n\n${String(err)}`,
      );
    }
  };

  const printReceipt = async (order: ReceiptDetails) => {
    try {
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Permission Denied",
          "Bluetooth permission is required to print.",
        );
        return;
      }
      await BLEPrinter.init();

      const devices: { device_name: string; inner_mac_address: string }[] =
        await BLEPrinter.getDeviceList();

      if (!devices || devices.length === 0) {
        Alert.alert("No Printers", "No paired Bluetooth printers found.");
        return;
      }

      const printer = devices.find(
        (d) => d.device_name?.toLowerCase() === "kprinter_8caa",
      );

      if (!printer) {
        Alert.alert(
          "Printer not found",
          `Paired devices: ${devices.map((d) => d.device_name).join(", ") || "none"}`,
        );
        return;
      }

      try {
        await BLEPrinter.closeConn();
      } catch {
        // ignore
      }

      await withTimeout(
        BLEPrinter.connectPrinter(printer.inner_mac_address),
        5000,
        "Printer connection",
      );

      await new Promise((r) => setTimeout(r, 300));

      // Print logo — centered on 58mm paper
      // paddingX pushes the image right; adjust if still off-center
      const logoBase64 = await getLogoBase64();
      if (logoBase64) {
        const imageWidth = 350;
        const imageHeight = 180;

        BLEPrinter.printImageBase64(logoBase64, {
          imageWidth,
          imageHeight: imageHeight,
          printerWidthType: PrinterWidth["58mm"],
        });
        await new Promise((r) => setTimeout(r, 400));
      }

      await BLEPrinter.printText("Desstea " + branchName, {});
      await BLEPrinter.printText("Order Invoice", {});

      const d = order.completedAt ?? new Date();
      const dateStr = d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = d
        .toLocaleTimeString("en-PH", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\u202f/g, " ");

      await BLEPrinter.printText("================================\n", {});

      const displayRef = order.orderRef
        ? `#${order.orderRef.slice(0, 6).toUpperCase()}`
        : "—";
      await BLEPrinter.printText(`Order ${displayRef}`, {});

      await BLEPrinter.printText(`Date: ${dateStr} ${timeStr}`, {});
      await BLEPrinter.printText(`Customer: ${order.customerName}`, {});
      await BLEPrinter.printText("--------------------------------\n", {});

      for (const item of order.items) {
        const price = getItemPrice(item);
        const lineTotal = price * item.quantity;

        if (item.itemType === "combo" && item.combo) {
          // Combo item: show combo name, then each selected product
          await BLEPrinter.printText(
            `${item.combo.name}\nx${item.quantity} ${lineTotal.toFixed(2)} `,
            {},
          );
          if (item.comboSelections?.length) {
            for (const sel of item.comboSelections) {
              await BLEPrinter.printText(`  - ${sel.productName}`, {});
              if (sel.addons?.length) {
                for (const aq of sel.addons) {
                  await BLEPrinter.printText(
                    `    + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
                    {},
                  );
                }
              }
            }
          }
        } else {
          // Regular product
          const parts: string[] = [];
          if (item.customization?.size) {
            parts.push(item.customization.size.label);
          }
          if (item.customization?.sugarLevel) {
            parts.push(item.customization.sugarLevel.label);
          }
          const suffix = parts.length ? ` (${parts.join(", ")})` : "";
          const catPrefix =
            item.categoryLabel && item.customization
              ? `(${item.categoryLabel.charAt(0).toUpperCase()}) `
              : "";
          await BLEPrinter.printText(
            `${catPrefix}${item.product.name}${suffix}\nx${item.quantity} ${lineTotal.toFixed(2)} `,
            {},
          );
          if (item.customization?.addonOptions?.length) {
            for (const aq of item.customization.addonOptions) {
              await BLEPrinter.printText(
                `  + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
                {},
              );
            }
          }
        }
      }

      await BLEPrinter.printText("--------------------------------\n", {});
      await BLEPrinter.printText(`TOTAL:     ${order.total.toFixed(2)}`, {});
      await BLEPrinter.printText("--------------------------------\n", {});
      await BLEPrinter.printText(`Payment: ${order.paymentMethod}`, {});

      if (order.paymentMethod === "Cash" && order.cashTendered != null) {
        await BLEPrinter.printText(
          `Cash:    ${order.cashTendered.toFixed(2)}`,
          {},
        );
        await BLEPrinter.printText(
          `Change:  ${(order.change ?? 0).toFixed(2)}`,
          {},
        );
      }

      await BLEPrinter.printText("================================\n", {});
      await BLEPrinter.printText("      Thank you Come again!\n", {});
      await BLEPrinter.printText("\n\n\n", {});

      // Wait for the customer receipt to finish printing, then print the kitchen copy
      await new Promise((r) => setTimeout(r, 4000));

      try {
        await BLEPrinter.printText("---- KITCHEN ORDER ----\n", {});

        const kitchenRef = order.orderRef
          ? `#${order.orderRef.slice(0, 6).toUpperCase()}`
          : "—";
        await BLEPrinter.printText(`Order ${kitchenRef}`, {});
        await BLEPrinter.printText(`Customer: ${order.customerName}`, {});
        await BLEPrinter.printText("--------------------------------\n", {});

        for (const item of order.items) {
          if (item.itemType === "combo" && item.combo) {
            await BLEPrinter.printText(
              `${item.combo.name} x${item.quantity}`,
              {},
            );
            if (item.comboSelections?.length) {
              for (const sel of item.comboSelections) {
                await BLEPrinter.printText(`  - ${sel.productName}`, {});
                if (sel.addons?.length) {
                  for (const aq of sel.addons) {
                    await BLEPrinter.printText(
                      `    + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
                      {},
                    );
                  }
                }
              }
            }
          } else {
            const parts: string[] = [];
            if (item.customization?.size) {
              parts.push(item.customization.size.label);
            }
            if (item.customization?.sugarLevel) {
              parts.push(item.customization.sugarLevel.label);
            }
            const suffix = parts.length ? ` (${parts.join(", ")})` : "";
            const catPrefix =
              item.categoryLabel && item.customization
                ? `(${item.categoryLabel.charAt(0).toUpperCase()}) `
                : "";
            await BLEPrinter.printText(
              `${catPrefix}${item.product.name}${suffix} x${item.quantity}`,
              {},
            );
            if (item.customization?.addonOptions?.length) {
              for (const aq of item.customization.addonOptions) {
                await BLEPrinter.printText(
                  `  + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
                  {},
                );
              }
            }
          }
        }

        await BLEPrinter.printText("--------------------------------\n", {});
        await BLEPrinter.printText("\n\n\n", {});
      } catch (e) {
        console.warn("Kitchen print failed:", e);
      }
    } catch (err: unknown) {
      Alert.alert("Print Error", `Could not print receipt.\n\n${String(err)}`);
    }
  };

  return { printTestMessage, printReceipt };
}
