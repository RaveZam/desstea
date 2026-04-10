import { Alert } from "react-native";
import { Asset } from "expo-asset";
import {
  BLEPrinter,
  PrinterWidth,
} from "react-native-thermal-receipt-printer-image-qr";
import { OrderItem } from "../../../store";
import { getItemPrice } from "../../pos/data/products";

export type ReceiptDetails = {
  customerName: string;
  paymentMethod: "Cash" | "GCash";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashTendered?: number;
  change?: number;
  completedAt?: Date;
  orderRef?: string;
};

async function getLogoBase64(): Promise<string | null> {
  try {
    const asset = Asset.fromModule(
      require("../../../assets/images/logo-padding.jpg"),
    );
    await asset.downloadAsync();
    if (!asset.localUri) return null;
    const response = await fetch(asset.localUri);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
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
  const printTestMessage = async () => {
    try {
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

      BLEPrinter.printText("Dear Baby\n", {});
      BLEPrinter.printText("I Love you lagi\n", {});
      BLEPrinter.printText("I Miss you so much\n", {});
      BLEPrinter.printText("You are always pretty and warm\n", {});
      BLEPrinter.printText(
        "Sorry lagi akong busy, i promise yayaman tayo\n",
        {},
      );
      BLEPrinter.printText("-Your Future Millionare Husband\n", {});
      BLEPrinter.printText("-Raven Tih\n\n\n", {});
    } catch (err: unknown) {
      Alert.alert(
        "Print Error",
        `Could not print. Make sure the printer is powered on and in range.\n\n${String(err)}`,
      );
    }
  };

  const printReceipt = async (order: ReceiptDetails) => {
    try {
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

      BLEPrinter.printText("Desstea Ipil Echauge Branch", {});
      BLEPrinter.printText("Order Invoice", {});

      const d = order.completedAt ?? new Date();
      const dateStr = d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = d.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      await BLEPrinter.printText("================================\n", {});

      await BLEPrinter.printText(`Order #: 284731d212`, {});

      await BLEPrinter.printText(`Date: ${dateStr} ${timeStr}`, {});
      await BLEPrinter.printText(`Customer: ${order.customerName}`, {});
      await BLEPrinter.printText("--------------------------------\n", {});

      for (const item of order.items) {
        const price = getItemPrice(item);
        const lineTotal = price * item.quantity;
        const name = item.customization
          ? `${item.product.name} (${item.customization.size})`
          : item.product.name;
        await BLEPrinter.printText(
          `${name}\nx${item.quantity} ${lineTotal.toFixed(2)} `,
          {},
        );
      }

      await BLEPrinter.printText("--------------------------------\n", {});
      await BLEPrinter.printText(`Subtotal:  ${order.subtotal.toFixed(2)}`, {});
      await BLEPrinter.printText(`VAT (12%): ${order.tax.toFixed(2)}`, {});
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
    } catch (err: unknown) {
      Alert.alert("Print Error", `Could not print receipt.\n\n${String(err)}`);
    }
  };

  return { printTestMessage, printReceipt };
}
