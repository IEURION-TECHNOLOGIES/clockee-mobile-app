import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../context/AuthContext";
import { getProfile, updateProfile } from "../../../../services/authService";

export default function EditProfile() {
  const router = useRouter();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res?.data?.success) {
        const data = res.data.data;
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= HANDLE SAVE ================= */
  const handleSave = async () => {
    setSaving(true);

    try {
      await updateProfile(form);

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.message || "Failed to update profile";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          placeholder="Enter your full name"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.address}
          onChangeText={(t) => setForm({ ...form, address: t })}
          placeholder="Enter your full address"
          multiline
          numberOfLines={3}
        />

        {/* Change Password Button */}
        {/* <TouchableOpacity
          style={styles.changePasswordBtn}
          onPress={() => router.push("/dashboard/changePassword")}
        >
          <Ionicons name="key-outline" size={20} color="#0EA5E9" />
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity> */}

        {/* SAVE BUTTON */}
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}
        {/* <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    marginTop: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 16,
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  changePasswordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F0F9FF",
    padding: 14,
    borderRadius: 10,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },

  changePasswordText: {
    color: "#0EA5E9",
    fontWeight: "600",
    fontSize: 15,
  },

  saveBtn: {
    backgroundColor: "#0EA5E9",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  logoutBtn: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

