import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

import { resetPassword } from "../../../services/authService";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams(); // 👈 from URL
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "All fields are required");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    try {
      setLoading(true);

      console.log("📡 Reset password request:", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      const res = await resetPassword(token, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      console.log("✅ RESPONSE:", res.data);

      if (res.data?.success) {
        Alert.alert("Success", "Password reset successful");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        router.replace("/Login");
      } else {
        Alert.alert("Error", res.data?.message || "Reset failed");
      }
    } catch (err: any) {
      console.log("❌ ERROR:", err?.response?.data || err.message);

      Alert.alert(
        "Error",
        err?.response?.data?.message || "Network error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.card}>
        {/* LOGO */}
        <Image
          source={require("../../../assets/images/splash/clockee_logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your current and new password
        </Text>

        {/* CURRENT PASSWORD */}
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        {/* NEW PASSWORD */}
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-open-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        {/* CONFIRM PASSWORD */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="checkmark-done-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* BUTTON */}
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </Pressable>

        {/* BACK */}
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },

  logo: {
    width: 42,
    height: 42,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#64748B",
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 6,
    marginTop: 10,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  button: {
    height: 50,
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  back: {
    textAlign: "center",
    marginTop: 16,
    color: "#0EA5E9",
    fontSize: 13,
    fontWeight: "500",
  },
});