import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

const DARK = "#1C1C1E";
const GRAY = "#8E8E93";
const SOFT = "#F5F5F7";
const DIVIDER = "#EFEFEF";
const WHITE = "#FFFFFF";
const RED = "#D9362B";
const RED_LIGHT = "#FFF0EF";

const PRESET_REASONS = [
  "Change of mind",
  "Changed order",
  "Wrong item",
  "Customer request",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function CancelOrderModal({ visible, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");

  function handlePreset(preset: string) {
    setReason(preset);
  }

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  }

  function handleClose() {
    setReason("");
    onClose();
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

          <Text style={styles.title}>Cancel Order</Text>
          <Text style={styles.subtitle}>Select or enter a reason for cancellation.</Text>

          <View style={styles.divider} />

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.presets}>
              {PRESET_REASONS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, reason === p && styles.chipSelected]}
                  onPress={() => handlePreset(p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, reason === p && styles.chipTextSelected]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Or type a custom reason…"
              placeholderTextColor={GRAY}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.confirmBtn, !reason.trim() && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!reason.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Cancel Order</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dismissBtn} onPress={handleClose} activeOpacity={0.7}>
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: WHITE,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: DIVIDER,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: RED,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: GRAY,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  body: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  chipSelected: {
    backgroundColor: RED_LIGHT,
    borderColor: RED,
  },
  chipText: {
    fontSize: 13,
    color: DARK,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: RED,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: DIVIDER,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: DARK,
    backgroundColor: SOFT,
    minHeight: 80,
  },
  confirmBtn: {
    backgroundColor: RED,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  dismissBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  dismissBtnText: {
    fontSize: 14,
    color: GRAY,
    fontWeight: "500",
  },
});
