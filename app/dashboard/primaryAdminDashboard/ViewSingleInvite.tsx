import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface Props {
  visible: boolean;
  invite: any;
  onClose: () => void;
}

export default function ViewInviteModal({
  visible,
  invite,
  onClose,
}: Props) {
  if (!invite) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* ===== TOP HEADER ===== */}
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>

            <Image
              source={{ uri: "https://i.pravatar.cc/300" }}
              style={styles.avatar}
            />
          </View>

          {/* ===== CONTENT ===== */}
          <View style={styles.content}>
            <View style={styles.nameRow}>
              <View>
                <Text style={styles.name}>{invite.name}</Text>
                <Text style={styles.branch}>{invite.branch}</Text>
              </View>

              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Admin</Text>
              </View>
            </View>

            

            {/* ===== ACTIONS ===== */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.approveBtn}>
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.denyBtn}>
                <Text style={styles.denyText}>Deny</Text>
              </TouchableOpacity>
            </View>
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
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },

  /* ===== HEADER ===== */

  topHeader: {
    height: 80,
    backgroundColor: "#5B678A",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: -40,
  },

  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },

  avatar: {
    width: 100,
    height: 103,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#fff",
    marginBottom: -43,
  },

  /* ===== CONTENT ===== */

  content: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 22,
    // alignItems: "center",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  name: {
    fontSize: 19,
    fontWeight: "600",
    color: "#0F172A",
  },

  roleBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 255,
    position: "absolute",
  },

  roleText: {
    fontSize: 13,
    color: "#0284C7",
    fontWeight: "500",
  },

  branch: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  /* ===== ACTIONS ===== */

  actions: {
    width: "100%",
    marginTop: 22,
    gap: 30,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

  },

  approveBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 999,
    alignItems: "center",
  },

  approveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  denyBtn: {
    borderWidth: 1,
    borderColor: "#9c9fa3ff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 999,
    alignItems: "center",
  },

  denyText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 14,
  },
});
