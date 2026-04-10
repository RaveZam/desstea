import { Alert } from "react-native";
import { BLEPrinter } from "react-native-thermal-receipt-printer-image-qr";
import { CompletedOrder } from "../../reports/types";
import { getItemPrice } from "../../pos/data/products";

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

  const printReceipt = async (order: CompletedOrder) => {
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

      const d = order.completedAt;
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
      await BLEPrinter.printText("         DESS TEA\n", {});
      await BLEPrinter.printText("================================\n", {});
      await BLEPrinter.printText(`Order #: ${order.id}\n`, {});
      await BLEPrinter.printText(`Date: ${dateStr}  ${timeStr}\n`, {});
      await BLEPrinter.printText(`Customer: ${order.customerName}\n`, {});
      await BLEPrinter.printText("--------------------------------\n", {});

      for (const item of order.items) {
        const price = getItemPrice(item);
        const lineTotal = price * item.quantity;
        const name = item.customization
          ? `${item.product.name} (${item.customization.size})`
          : item.product.name;
        await BLEPrinter.printText(
          `${name}\n  x${item.quantity}  ₱${price.toFixed(2)}  ₱${lineTotal.toFixed(2)}\n`,
          {},
        );
      }

      await BLEPrinter.printText("--------------------------------\n", {});
      await BLEPrinter.printText(`Subtotal:  ₱${order.subtotal.toFixed(2)}\n`, {});
      await BLEPrinter.printText(`VAT (12%): ₱${order.tax.toFixed(2)}\n`, {});
      await BLEPrinter.printText(`TOTAL:     ₱${order.total.toFixed(2)}\n`, {});
      await BLEPrinter.printText("--------------------------------\n", {});
      await BLEPrinter.printText(`Payment: ${order.paymentMethod}\n`, {});

      if (order.paymentMethod === "Cash" && order.cashAmount != null) {
        await BLEPrinter.printText(`Cash:    ₱${order.cashAmount.toFixed(2)}\n`, {});
        await BLEPrinter.printText(
          `Change:  ₱${(order.change ?? 0).toFixed(2)}\n`,
          {},
        );
      }

      await BLEPrinter.printText("================================\n", {});
      await BLEPrinter.printText("      Thank you! Come again!\n", {});
      await BLEPrinter.printText("\n\n\n", {});
    } catch (err: unknown) {
      Alert.alert(
        "Print Error",
        `Could not print receipt.\n\n${String(err)}`,
      );
    }
  };

  return { printTestMessage, printReceipt };
}
