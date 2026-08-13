import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ConfirmActionModal({
  visible,
  title,
  message,
  confirmText,
  danger,
  onConfirm,
  onCancel,
}: any) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[
              styles.confirm,
              danger && { backgroundColor: "#DC2626" },
            ]}
            onPress={onConfirm}
          >
            <Text style={{ color: "#FFF" }}>{confirmText}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modal: {
    backgroundColor: "#FFF",
    margin: 20,
    borderRadius: 14,
    padding: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  message: {
    color: "#64748B",
    marginBottom: 20,
  },

  confirm: {
    backgroundColor: "#0284C7",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#64748B",
  },
});