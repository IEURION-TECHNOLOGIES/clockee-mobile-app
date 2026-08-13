import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DisableInviteModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Disable Invite?</Text>
          <Text style={styles.desc}>
            This invite link will no longer be usable.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.disable} onPress={onConfirm}>
              <Text style={styles.disableText}>Disable</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  desc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelText: { fontWeight: "600" },
  disable: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  disableText: {
    color: "#fff",
    fontWeight: "600",
  },
});
