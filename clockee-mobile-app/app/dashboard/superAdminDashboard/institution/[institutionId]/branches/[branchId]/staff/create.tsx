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

import { createStaff } from "@/services/superAdminServices";
import { useAssignStaff } from "@/hooks/useAssignStaff";

export default function CreateStaff() {
  const router = useRouter();

  const { institutionId, branchId } = useLocalSearchParams<{
    institutionId: string;
    branchId: string;
  }>();

  const { mutateAsync: assignStaff } = useAssignStaff();

  const [form, setForm] = useState({
    name: "",
    email: "",
    departmentOrUnit: "",
    studentOrStaffId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= INITIAL LOG ================= */

  useEffect(() => {
    console.log("📍 CreateStaff Screen Mounted");
    console.log("🏫 Institution ID:", institutionId);
    console.log("🏢 Branch ID:", branchId);
  }, []);

  /* ================= VALIDATION ================= */

  const validate = () => {
    console.log("🔎 Running validation...");
    console.log("📝 Current form:", form);

    if (
      !form.name ||
      !form.email ||
      !form.departmentOrUnit ||
      !form.studentOrStaffId ||
      !form.password
    ) {
      console.log("❌ Validation failed: Missing fields");
      return "Please fill all fields";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      console.log("❌ Validation failed: Invalid email");
      return "Invalid email";
    }

    if (form.password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return "Password must be at least 6 characters";
    }

    if (!institutionId || !branchId) {
      console.log("❌ Validation failed: Missing route params");
      return "Missing route parameters";
    }

    console.log("✅ Validation passed");
    return "";
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    console.log("🚀 Submit pressed");

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📡 Creating staff...");
      console.log("📦 Payload:", {
        institutionId,
        ...form,
      });

      // 1️⃣ Create Staff
const res = await createStaff(institutionId, {
  ...form,
  role: ["staff"],
});

console.log("✅ CreateStaff Response:", res?.data);

const createdUser = res?.data?.user; // ✅ FIXED

if (!createdUser?._id) {
  console.log("❌ No user ID returned!");
  throw new Error("User creation failed");
}

console.log("👤 Created User ID:", createdUser._id);

      // 2️⃣ Assign to Branch
      console.log("📡 Assigning staff to branch...");
      console.log("📦 Assign Payload:", {
        institutionId,
        userId: createdUser._id,
        branchId,
      });

      await assignStaff({
        institutionId,
        userId: createdUser._id,
        branchId,
      });

      console.log("✅ Staff assigned successfully");

      // 3️⃣ Navigate
      const destination = `/dashboard/superAdminDashboard/institution/${institutionId}/branches/${branchId}`;
      console.log("➡ Navigating to:", destination);

      router.replace(destination);
    } catch (err: any) {
      console.log("❌ ERROR OCCURRED");
      console.log("Message:", err?.message);
      console.log("Status:", err?.response?.status);
      console.log("Server Response:", err?.response?.data);
      console.log("Full Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create & assign staff"
      );
    } finally {
      console.log("🔄 Loading finished");
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} />
        </Pressable>
        <Text style={styles.title}>Create Staff</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Input
          label="Full Name"
          value={form.name}
          onChange={(v: string) =>
            setForm({ ...form, name: v })
          }
        />

        <Input
          label="Email"
          value={form.email}
          keyboard="email-address"
          onChange={(v: string) =>
            setForm({ ...form, email: v })
          }
        />

        <Input
          label="Department"
          value={form.departmentOrUnit}
          onChange={(v: string) =>
            setForm({ ...form, departmentOrUnit: v })
          }
        />

        <Input
          label="Staff ID"
          value={form.studentOrStaffId}
          onChange={(v: string) =>
            setForm({ ...form, studentOrStaffId: v })
          }
        />

        <Input
          label="Password"
          value={form.password}
          secure
          onChange={(v: string) =>
            setForm({ ...form, password: v })
          }
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.button,
            loading && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="person-add-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>
                Create & Assign Staff
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ================= INPUT ================= */

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
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
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
  footer: {
    paddingVertical: 14,
  },
  button: {
    backgroundColor: "#0284C7",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
