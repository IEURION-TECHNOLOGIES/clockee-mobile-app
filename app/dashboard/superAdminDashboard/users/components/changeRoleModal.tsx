import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ROLES = ["staff", "admin", "primaryAdmin"];

export default function ChangeRoleModal({
  visible,
  user,
  onClose,
}: any) {
  const [selectedRole, setSelectedRole] = useState(user?.role);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Change Role</Text>

          {ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.role,
                selectedRole === role && styles.active,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text>{role}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.save}>
            <Text style={{ color: "#FFF" }}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
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
    marginBottom: 20,
  },

  role: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    marginBottom: 10,
  },

  active: {
    backgroundColor: "#BAE6FD",
  },

  save: {
    backgroundColor: "#0284C7",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#64748B",
  },
});