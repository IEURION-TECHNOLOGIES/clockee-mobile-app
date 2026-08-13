import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserActionsModal({
  visible,
  user,
  onClose,
  onViewProfile,
  onChangeRole,
  onCreatePassword,
  onForceLogout,
  onDeactivate,
  onDelete,
}: any) {
  if (!user) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{user.name}</Text>

          <Action icon="person-outline" label="View Profile" onPress={onViewProfile} />
          <Action icon="swap-horizontal-outline" label="Change Role" onPress={onChangeRole} />
          <Action icon="lock-closed-outline" label="Create Password" onPress={onCreatePassword} />
          <Action icon="log-out-outline" label="Force Logout" onPress={onForceLogout} />
          <Action icon="pause-circle-outline" label="Deactivate User" onPress={onDeactivate} />
          <Action icon="trash-outline" label="Delete User" danger onPress={onDelete} />

          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={{ color: "#64748B" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Action({ icon, label, onPress, danger }: any) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? "#DC2626" : "#0F172A"}
      />
      <Text style={[styles.label, danger && { color: "#DC2626" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  label: {
    fontSize: 14,
    marginLeft: 12,
    fontWeight: "500",
  },

  close: {
    alignItems: "center",
    marginTop: 10,
  },
});