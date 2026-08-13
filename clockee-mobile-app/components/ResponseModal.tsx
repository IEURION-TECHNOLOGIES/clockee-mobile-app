import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  type?: "success" | "error" | "info";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
};

export default function ResponseModal({
  visible,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmText,
}: Props) {
  const iconMap = {
    success: { name: "checkmark-circle", color: "#22C55E" },
    error: { name: "close-circle", color: "#EF4444" },
    info: { name: "information-circle", color: "#0EA5E9" },
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons
            name={iconMap[type].name as any}
            size={64}
            color={iconMap[type].color}
          />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {onConfirm ? (
              <>
                {/* Cancel */}
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, { color: "#0F172A" }]}>
                    Cancel
                  </Text>
                </Pressable>

                {/* Confirm */}
                <Pressable
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                >
                  <Text style={styles.buttonText}>
                    {confirmText || "Confirm"}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[styles.button, styles.singleButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>OK</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    color: "#0F172A",
  },

  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    color: "#475569",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 24,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },

  cancelButton: {
    backgroundColor: "#E2E8F0",
  },

  confirmButton: {
    backgroundColor: "#EF4444",
  },

  singleButton: {
    backgroundColor: "#0EA5E9",
    marginHorizontal: 0,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});

