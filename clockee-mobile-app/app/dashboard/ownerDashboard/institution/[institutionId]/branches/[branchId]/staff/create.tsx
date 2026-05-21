import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";

import { useProfile } from "@/hooks/useProfile";
import {
  createStaffByAdmin,
  assignStaffToBranchByAdmin,
} from "@/services/superAdminServices";

export default function CreateStaff() {
  const router = useRouter();
  const { branchId } = useLocalSearchParams<{ branchId: string }>();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const institutionId = profile?.institutionId;

  const [form, setForm] = useState({
    name: "",
    email: "",
    departmentOrUnit: "",
    studentOrStaffId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🏫 Institution ID:", institutionId);
    console.log("🏢 Branch ID:", branchId);
  }, [institutionId, branchId]);

  const validate = (): string => {
    if (!form.name || !form.email || !form.departmentOrUnit || !form.studentOrStaffId || !form.password) {
      return "Please fill all fields";
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Invalid email address";
    }
    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (!institutionId) return "Institution ID not found";
    if (!branchId) return "Branch ID not found";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create Staff
      const createPayload = {
        ...form,
        role: ["staff"],           // Important
      };

      console.log("📦 Creating staff:", createPayload);

      const createRes = await createStaffByAdmin(createPayload);
      const createdUser = createRes?.data?.user || createRes?.data;

      if (!createdUser?._id) {
        throw new Error("Failed to create staff - no user ID returned");
      }

      console.log("✅ Staff created:", createdUser._id);

      // 2. Assign to Branch
      console.log("📦 Assigning to branch...");
      await assignStaffToBranchByAdmin(institutionId!, createdUser._id, branchId!);

      console.log("🎉 Staff created and assigned successfully!");

      // Navigate back to branch
      router.replace({
        pathname: "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]",
        params: { institutionId: institutionId!, branchId: branchId! },
      });
    } catch (err: any) {
      console.error("❌ Error:", err?.response?.data || err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create staff"
      );
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Create New Staff</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Input label="Full Name" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
        <Input label="Email Address" value={form.email} keyboard="email-address" onChange={(v: string) => setForm({ ...form, email: v })} />
        <Input label="Department / Unit" value={form.departmentOrUnit} onChange={(v: string) => setForm({ ...form, departmentOrUnit: v })} />
        <Input label="Staff ID" value={form.studentOrStaffId} onChange={(v: string) => setForm({ ...form, studentOrStaffId: v })} />
        <Input label="Password" value={form.password} secure onChange={(v: string) => setForm({ ...form, password: v })} />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Create & Assign Staff</Text>
            </>
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
  <View style={{ marginBottom: 16 }}>
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
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "700" },

  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, color: "#334155" },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 16,
  },

  error: { color: "#DC2626", fontSize: 13, marginTop: 8, marginBottom: 12 },

  footer: { paddingVertical: 16 },
  button: {
    backgroundColor: "#0284C7",
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
