import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";

import { createAdmin } from "@/services/superAdminServices";

export default function AssignInstitutionAdmin() {
   const router = useRouter();
   const { institutionId } = useLocalSearchParams<{
     institutionId: string;
   }>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    staffId: "",
    department: "",
    password: "",
  });

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (
      !admin.name.trim() ||
      !admin.email.trim() ||
      !admin.phone.trim() ||
      !admin.staffId.trim() ||
      !admin.department.trim() ||
      !admin.password.trim()
    ) {
      return "All fields are required";
    }

    if (!/\S+@\S+\.\S+/.test(admin.email)) {
      return "Invalid email address";
    }

    if (admin.phone.length < 10) {
      return "Invalid phone number";
    }

    if (admin.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }

    if (!institutionId) {
      Alert.alert("Error", "Institution ID missing");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: admin.name.trim(),
        email: admin.email.trim().toLowerCase(),
        phone: admin.phone.trim(),
        role: ["admin"],
        departmentOrUnit: admin.department.trim(),
        studentOrStaffId: admin.staffId.trim(),
        password: admin.password,
      };

      const response = await createAdmin(institutionId, payload);

      Alert.alert("Success", response?.message || "Admin created successfully");

      router.back();
    } catch (err: any) {
      console.log("Create admin error:", err?.response?.data || err.message);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create admin";

      setError(backendMessage);
      Alert.alert("Error", backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Create Institution Admin</Text>
      </View>

      {/* FORM */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input
          label="Admin Name"
          value={admin.name}
          onChange={(v: string) => setAdmin({ ...admin, name: v })}
        />

        <Input
          label="Email"
          value={admin.email}
          keyboard="email-address"
          onChange={(v: string) => setAdmin({ ...admin, email: v })}
        />

        <Input
          label="Phone"
          value={admin.phone}
          keyboard="phone-pad"
          onChange={(v: string) => setAdmin({ ...admin, phone: v })}
        />

        <Input
          label="Staff ID"
          value={admin.staffId}
          onChange={(v: string) => setAdmin({ ...admin, staffId: v })}
        />

        <Input
          label="Department / Unit"
          value={admin.department}
          onChange={(v: string) => setAdmin({ ...admin, department: v })}
        />

        <Input
          label="Password"
          value={admin.password}
          secure
          onChange={(v: string) => setAdmin({ ...admin, password: v })}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Admin</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ================= INPUT COMPONENT ================= */

const Input = ({
  label,
  value,
  onChange,
  keyboard = "default",
  secure = false,
}: any) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      keyboardType={keyboard}
      secureTextEntry={secure}
      onChangeText={onChange}
      autoCapitalize="none"
    />
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  error: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 10,
  },
  footer: { paddingVertical: 14 },
  button: {
    backgroundColor: "#0284C7",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

