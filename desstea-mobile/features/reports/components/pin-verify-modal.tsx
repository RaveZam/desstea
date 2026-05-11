import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAdminPin } from "@/features/settings/services/admin-pin";

const BRAND = "#E8692A";
const BRAND_LIGHT = "#FFF3ED";
const DARK = "#1C1C1E";
const GRAY = "#8E8E93";
const WHITE = "#FFFFFF";
const SOFT = "#F5F5F7";
const DIVIDER = "#EFEFEF";
const PIN_LENGTH = 4;

type Props = {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
};

function PinDots({ value }: { value: string }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < value.length && styles.dotFilled]}
        />
      ))}
    </View>
  );
}

function NumKey({
  label,
  onPress,
  icon,
}: {
  label?: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <TouchableOpacity style={styles.key} onPress={onPress} activeOpacity={0.6}>
      {icon ? (
        <Ionicons name={icon} size={22} color={DARK} />
      ) : (
        <Text style={styles.keyText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function PinVerifyModal({ visible, onClose, onVerified }: Props) {
  const [pin, setPin] = useState("");
  const [shaking, setShaking] = useState(false);

  function handleClose() {
    setPin("");
    onClose();
  }

  function handleDigit(d: string) {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);

    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        const stored = getAdminPin();
        if (stored === null) {
          Alert.alert(
            "No PIN Set",
            "Please set up an Admin PIN in Settings first."
          );
          setPin("");
          onClose();
          return;
        }
        if (next === stored) {
          setPin("");
          onVerified();
        } else {
          setShaking(true);
          setTimeout(() => {
            setPin("");
            setShaking(false);
          }, 400);
        }
      }, 150);
    }
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1));
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed" size={22} color={BRAND} />
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Enter Admin PIN</Text>
          <Text style={styles.subtitle}>
            {shaking ? "Incorrect PIN. Try again." : "Required to reprint this order"}
          </Text>

          <PinDots value={pin} />

          <View style={styles.divider} />

          <View style={styles.pad}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <NumKey key={d} label={d} onPress={() => handleDigit(d)} />
            ))}
            <View style={styles.key} />
            <NumKey label="0" onPress={() => handleDigit("0")} />
            <NumKey icon="backspace-outline" onPress={handleDelete} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: WHITE,
    borderRadius: 24,
    overflow: "hidden",
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: DIVIDER,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK,
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 13,
    color: GRAY,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 28,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: BRAND,
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: BRAND,
  },
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 0,
  },
  key: {
    width: "33.33%",
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "500",
    color: DARK,
  },
});
