import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const users = [
  { name: "Mimi Jakes", status: "Accepted" },
  { name: "Mimi Jakes", status: "Pending" },
  { name: "Mimi Jakes", status: "Accepted" },
  { name: "Mimi Jakes", status: "Accepted" },
  { name: "Mimi Jakes", status: "Expired" },
];

export default function ExtraInvitePreviewModal({
  visible,
  onClose,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* CLOSE */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#0F172A" />
          </TouchableOpacity>

          {users.map((u, i) => (
            <View key={i} style={styles.row}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150" }}
                style={styles.avatar}
              />

              <Text style={styles.name}>{u.name}</Text>

              <Text
                style={[
                  styles.status,
                  u.status === "Accepted" && styles.accepted,
                  u.status === "Pending" && styles.pending,
                  u.status === "Expired" && styles.expired,
                ]}
              >
                {u.status}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */

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
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },

  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },

  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },

  status: {
    fontSize: 13,
    fontWeight: "500",
  },

  accepted: { color: "#64748B" },
  pending: { color: "#0284C7" },
  expired: { color: "#0284C7" },
});
