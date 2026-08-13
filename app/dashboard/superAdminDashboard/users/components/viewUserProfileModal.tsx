import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ViewUserProfileModal({
  visible,
  user,
  onClose,
}: any) {
  if (!user) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Top Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150" }}
              style={styles.avatar}
            />
          </View>

          {/* User Name */}
          <Text style={styles.name}>{user.name}</Text>

          {/* Role Badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>

          {/* User Details */}
          <View style={styles.infoBox}>
            <ProfileItem label="Institution" value={user.institution} />
            <ProfileItem label="Branch" value={user.branch} />
            <ProfileItem label="Email" value="user@email.com" />
            <ProfileItem label="Status" value="Active" />
          </View>

        </View>
      </View>
    </Modal>
  );
}

function ProfileItem({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingBottom: 20,
    alignItems: "center",
  },

  header: {
    width: "100%",
    height: 70,
    backgroundColor: "#5A6B8C",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 15,
  },

  closeBtn: {
    padding: 5,
  },

  avatarWrapper: {
    marginTop: -40,
    marginBottom: 10,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFF",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  roleBadge: {
    backgroundColor: "#D9EAF7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 15,
  },

  roleText: {
    color: "#0284C7",
    fontWeight: "600",
    fontSize: 12,
  },

  infoBox: {
    width: "90%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 15,
  },

  row: {
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

});