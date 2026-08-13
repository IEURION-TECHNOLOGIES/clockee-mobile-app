import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { changePassword } from "../../services/authService";

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Enter your current password");
      return;
    }

    if (!newPassword) {
      Alert.alert("Error", "Enter your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    const payload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    console.log("🚀 CHANGE PASSWORD REQUEST:");
    console.log(payload);

    try {
      setLoading(true);

      const res = await changePassword(payload);

      console.log("✅ RESPONSE STATUS:", res?.status);
      console.log("✅ RESPONSE DATA:", res?.data);

      if (res.data?.success) {
        Alert.alert("Success", "Password changed successfully");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        router.replace("/auth/generalAuth/Login");
      } else {
        console.log("❌ API FAILED RESPONSE:", res?.data);

        Alert.alert(
          "Error",
          res.data?.message || "Failed to change password"
        );
      }
    } catch (err: any) {
      console.log("🔥 FULL ERROR OBJECT:");
      console.log(err);

      console.log("❌ ERROR RESPONSE:");
      console.log(err?.response);

      console.log("❌ ERROR RESPONSE DATA:");
      console.log(err?.response?.data);

      console.log("❌ ERROR MESSAGE:");
      console.log(err?.message);

      console.log("❌ ERROR STACK:");
      console.log(err?.stack);

      Alert.alert(
        "Error",
        err?.response?.data?.message || err.message || "Network error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.card}>
        <Image
          source={require("../../assets/images/splash/clockee_logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Enter your current password and set a new one
        </Text>

        {/* CURRENT PASSWORD */}
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        {/* NEW PASSWORD */}
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Create new password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        {/* CONFIRM PASSWORD */}
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* BUTTON */}
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
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

