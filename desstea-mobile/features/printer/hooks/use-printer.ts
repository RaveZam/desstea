import { Alert } from "react-native";
import { BLEPrinter } from "react-native-thermal-receipt-printer-image-qr";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
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

      await BLEPrinter.printText("Dear Baby\n", {});
      await BLEPrinter.printText("I Love you lagi\n", {});
      await BLEPrinter.printText("I Miss you so much\n", {});
      await BLEPrinter.printText("You are always pretty and warm\n", {});
      await BLEPrinter.printText(
        "Sorry lagi akong busy, i promise yayaman tayo\n",
        {},
      );
      await BLEPrinter.printText("-Your Future Millionare Husband\n", {});
      await BLEPrinter.printText("-Raven Tih\n\n\n", {});
    } catch (err: unknown) {
      Alert.alert(
        "Print Error",
        `Could not print. Make sure the printer is powered on and in range.\n\n${String(err)}`,
      );
    }
  };

  return { printTestMessage };
}
