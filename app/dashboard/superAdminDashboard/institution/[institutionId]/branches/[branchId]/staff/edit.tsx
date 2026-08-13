import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";


import { editUser } from "@/services/superAdminServices";
import ResponseModal from "@/components/ResponseModal";

export default function EditStaff() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [staff, setStaff] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    departmentOrUnit: "",
  });

  const [modal, setModal] = useState({
  visible: false,
  type: "info" as "success" | "error" | "info",
  title: "",
  message: "",
});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD STAFF FROM PARAMS ================= */
  useEffect(() => {
    console.log("🟡 EditStaff mounted");

    try {
      const staffParam = params.staff;

      if (!staffParam || typeof staffParam !== "string") {
        console.log("❌ No staff param provided");
        setError("Invalid staff data");
        setLoading(false);
        return;
      }

      const parsedStaff = JSON.parse(staffParam);

      console.log("✅ Parsed staff object:", parsedStaff);

      setStaff(parsedStaff);

      setForm({
        name: parsedStaff.name || "",
        phone: parsedStaff.phone || "",
        departmentOrUnit: parsedStaff.departmentOrUnit || "",
      });
    } catch (err) {
      console.log("❌ Failed to parse staff:", err);
      setError("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SAVE ================= */
  const handleSave = async () => {
  if (!staff) return;

  if (!form.name || !form.phone || !form.departmentOrUnit) {
    setModal({
      visible: true,
      type: "info",
      title: "Missing Fields",
      message: "All fields are required.",
    });
    return;
  }

  try {
    setSaving(true);

    await editUser(staff.id, {
      name: form.name.trim(),
      phone: form.phone.trim(),
      departmentOrUnit: form.departmentOrUnit.trim(),
    });

    setModal({
      visible: true,
      type: "success",
      title: "Success",
      message: "Staff updated successfully.",
    });
  } catch (err) {
    setModal({
      visible: true,
      type: "error",
      title: "Update Failed",
      message: "Something went wrong. Please try again.",
    });
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Edit Staff</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView>
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={form.name}
            onChange={(v: string) => setForm({ ...form, name: v })}
          />

          <Input
            label="Phone"
            value={form.phone}
            keyboard="phone-pad"
            onChange={(v: string) => setForm({ ...form, phone: v })}
          />

          <Input
            label="Department / Unit"
            value={form.departmentOrUnit}
            onChange={(v: string) =>
              setForm({ ...form, departmentOrUnit: v })
            }
          />

          <ResponseModal
            visible={modal.visible}
            type={modal.type}
            title={modal.title}
            message={modal.message}
            onClose={() => {
              setModal({ ...modal, visible: false });

              // Go back ONLY on success
              if (modal.type === "success") {
                router.back();
              }
            }}
          />

        </View>
      </ScrollView>

      <Pressable
        style={[styles.button, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </Pressable>
    </View>
  );
}

/* ================= REUSABLE INPUT ================= */
const Input = ({ label, value, onChange, keyboard = "default" }: any) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      keyboardType={keyboard}
      onChangeText={onChange}
    />
  </>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingTop: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  title: { fontSize: 17, fontWeight: "800" },

  form: { padding: 16 },

  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  error: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 8,
  },

  button: {
    height: 54,
    backgroundColor: "#0284C7",
    margin: 16,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
