import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function CreatePasswordModal({
  visible,
  onClose,
}: any) {
  const [password, setPassword] = useState("");

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Create Password</Text>

          <TextInput
            placeholder="Enter new password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.save}>
            <Text style={{ color: "#FFF" }}>Create Password</Text>
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

  input: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  save: {
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