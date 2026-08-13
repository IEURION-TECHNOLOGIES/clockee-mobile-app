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

import { forgotPassword } from "../../../services/authService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      setLoading(true);

      console.log("📡 Sending forgot password request...", email);

      const res = await forgotPassword(email);

      console.log("✅ RESPONSE:", res.data);

      if (res.data?.success) {
        Alert.alert(
          "Success",
          "Reset link has been sent to your email"
        );

        setEmail("");

        // optional navigation
        router.push("./Login");
      } else {
        Alert.alert("Error", res.data?.message || "Request failed");
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

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email to reset your password
        </Text>

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* BUTTON */}
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </Pressable>

        {/* BACK */}
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back to login</Text>
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
