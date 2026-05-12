import { Alert, PermissionsAndroid, Platform } from "react-native";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import {
  BLEPrinter,
  PrinterWidth,
} from "react-native-thermal-receipt-printer-image-qr";
import { CompletedOrder } from "../../reports/types";
import { useBranchName } from "../../auth/hooks/use-branch-name";

// --- Helpers (duplicated from use-printer.ts, not exported there) ---

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

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

// --- Layout helpers for 32-char 58mm paper ---

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return str + " ".repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return " ".repeat(len - str.length) + str;
}

// Format: TIME(6) + " " + NAME(9) + TOTAL(8) + DISC(8) = 32
// Cancelled orders show "[X]" in the DISC column instead of a discount amount.
function formatOrderLine(order: CompletedOrder): string {
  const cancelled = order.status === "cancelled";

  const rawTime = order.completedAt
    .toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\u202f/g, "")
    .replace(/\s/g, ""); // e.g. "2:30PM"
  const time = padRight(rawTime, 6);
  const name = padRight(order.customerName, 9);

  let disc: string;
  if (cancelled) {
    disc = padLeft("[X]", 8);
  } else if ((order.discountAmount ?? 0) > 0) {
    disc = padLeft(order.discountAmount.toFixed(2), 8);
  } else {
    disc = " ".repeat(8);
  }

  const amount = padLeft(order.total.toFixed(2), 8);
  return `${time} ${name}${amount}${disc}`;
}

// ---

export function usePrintDailySummary() {
  const { branchName } = useBranchName();

  const printDailySummary = async (orders: CompletedOrder[], date: Date) => {
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
          `Paired devices: ${devices.map((d) => d.device_name).join(", ") || "none"}\n\nPair Kprinter_8caa in Bluetooth settings first.`,
        );
        return;
      }

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

      await new Promise((r) => setTimeout(r, 300));

      const logoBase64 = await getLogoBase64();
      if (logoBase64) {
        BLEPrinter.printImageBase64(logoBase64, {
          imageWidth: 350,
          imageHeight: 180,
          printerWidthType: PrinterWidth["58mm"],
        });
        await new Promise((r) => setTimeout(r, 400));
      }

      const dateStr = date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const printedTimeStr = new Date()
        .toLocaleTimeString("en-PH", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\u202f/g, " ");

      const cancelled = orders.filter((o) => o.status === "cancelled");
      const completed = orders.filter((o) => o.status !== "cancelled");
      const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);

      const lines: string[] = [];
      lines.push(`Desstea ${branchName}`);
      lines.push("Daily Summary Report");
      lines.push("================================");
      lines.push(`Date: ${dateStr}`);
      lines.push(`Printed: ${printedTimeStr}`);
      lines.push("================================");

      // Column header: TIME(6) + " " + NAME(9) + TOTAL(8) + DISC(8) = 32
      lines.push(
        `${padRight("Time", 6)} ${padRight("Name", 9)}${padLeft("Total", 8)}${padLeft("Disc", 8)}`,
      );
      lines.push("--------------------------------");

      for (const order of orders) {
        lines.push(formatOrderLine(order));
      }

      lines.push("--------------------------------");
      lines.push(`Total Orders: ${orders.length}`);
      lines.push(`Cancelled: ${cancelled.length}`);
      lines.push(`TOTAL REVENUE:  ${padLeft(totalRevenue.toFixed(2), 9)}`);
      lines.push("================================");
      lines.push("\n\n\n");

      await BLEPrinter.printText(lines.join("\n"), {});
    } catch (err: unknown) {
      Alert.alert(
        "Print Error",
        `Could not print daily summary.\n\n${String(err)}`,
      );
    }
  };

  return { printDailySummary };
}
