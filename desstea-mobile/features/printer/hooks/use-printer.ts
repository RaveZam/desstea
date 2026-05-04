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
      const logoBase64 = await getLogoBase64();
      if (logoBase64) {
        BLEPrinter.printImageBase64(logoBase64, {
          imageWidth: 350,
          imageHeight: 180,
          printerWidthType: PrinterWidth["58mm"],
        });
        await new Promise((r) => setTimeout(r, 400));
      }

      // Build the entire customer receipt as a single string
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

      const displayRef = order.orderRef
        ? `#${order.orderRef.slice(0, 6).toUpperCase()}`
        : "—";

      const lines: string[] = [];
      lines.push(`Desstea ${branchName}`);
      lines.push("Order Invoice");
      lines.push("================================");
      lines.push(`Order ${displayRef}`);
      lines.push(`Date: ${dateStr} ${timeStr}`);
      lines.push(`Customer: ${order.customerName}`);
      lines.push("--------------------------------");

      for (const item of order.items) {
        const price = getItemPrice(item);
        const lineTotal = price * item.quantity;

        if (item.itemType === "combo" && item.combo) {
          lines.push(
            `${item.combo.name}\nx${item.quantity} ${lineTotal.toFixed(2)} `,
          );
          if (item.comboSelections?.length) {
            for (const sel of item.comboSelections) {
              lines.push(`  - ${sel.productName}`);
              if (sel.addons?.length) {
                for (const aq of sel.addons) {
                  lines.push(
                    `    + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
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
          if (item.customization?.temperature) {
            parts.push(item.customization.temperature);
          }
          if (item.customization?.flavor) {
            parts.push(item.customization.flavor.label);
          }
          const suffix = parts.length ? ` (${parts.join(", ")})` : "";
          const catPrefix =
            item.categoryLabel && item.customization
              ? `(${item.categoryLabel.charAt(0).toUpperCase()}) `
              : "";
          lines.push(
            `${catPrefix}${item.product.name}${suffix}\nx${item.quantity} ${lineTotal.toFixed(2)} `,
          );
          if (item.customization?.addonOptions?.length) {
            for (const aq of item.customization.addonOptions) {
              lines.push(
                `  + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
              );
            }
          }
        }
      }

      lines.push("--------------------------------");
      lines.push(`TOTAL:     ${order.total.toFixed(2)}`);
      lines.push("--------------------------------");
      lines.push(`Payment: ${order.paymentMethod}`);

      if (order.paymentMethod === "Cash" && order.cashTendered != null) {
        lines.push(`Cash:    ${order.cashTendered.toFixed(2)}`);
        lines.push(`Change:  ${(order.change ?? 0).toFixed(2)}`);
      }

      lines.push("================================\n");
      lines.push("      Thank you Come again!\n");
      lines.push("      This Document is not\n  valid for claim of input tax");
      lines.push("\n\n\n");

      await BLEPrinter.printText(lines.join("\n"), {});

      // Wait for the customer receipt to finish printing, then print the kitchen copy
      // Base 3s + 300ms per item to account for longer receipts
      const receiptDelay = 3000 + order.items.length * 300;
      await new Promise((r) => setTimeout(r, receiptDelay));

      try {
        const kitchenRef = order.orderRef
          ? `#${order.orderRef.slice(0, 6).toUpperCase()}`
          : "—";

        const kitchenLines: string[] = [];
        kitchenLines.push("---- KITCHEN ORDER ----");
        kitchenLines.push(`Order ${kitchenRef}`);
        kitchenLines.push(`Customer: ${order.customerName}`);
        kitchenLines.push("--------------------------------");

        for (const item of order.items) {
          if (item.itemType === "combo" && item.combo) {
            kitchenLines.push(`${item.combo.name} x${item.quantity}`);
            if (item.comboSelections?.length) {
              for (const sel of item.comboSelections) {
                kitchenLines.push(`  - ${sel.productName}`);
                if (sel.addons?.length) {
                  for (const aq of sel.addons) {
                    kitchenLines.push(
                      `    + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
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
            if (item.customization?.temperature) {
              parts.push(item.customization.temperature);
            }
            if (item.customization?.flavor) {
              parts.push(item.customization.flavor.label);
            }
            const suffix = parts.length ? ` (${parts.join(", ")})` : "";
            const catPrefix =
              item.categoryLabel && item.customization
                ? `(${item.categoryLabel.charAt(0).toUpperCase()}) `
                : "";
            kitchenLines.push(
              `${catPrefix}${item.product.name}${suffix} x${item.quantity}`,
            );
            if (item.customization?.addonOptions?.length) {
              for (const aq of item.customization.addonOptions) {
                kitchenLines.push(
                  `  + ${aq.option.name}${aq.qty > 1 ? ` x${aq.qty}` : ""}`,
                );
              }
            }
          }
        }

        kitchenLines.push("--------------------------------");
        kitchenLines.push("\n\n\n");

        await BLEPrinter.printText(kitchenLines.join("\n"), {});
      } catch (e) {
        console.warn("Kitchen print failed:", e);
      }
    } catch (err: unknown) {
      Alert.alert("Print Error", `Could not print receipt.\n\n${String(err)}`);
    }
  };

  return { printTestMessage, printReceipt };
}
