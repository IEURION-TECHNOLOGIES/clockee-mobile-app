import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Device from "expo-device";
// import * as Application from "expo-application";

import ClockLoader from "../../../components/ClockLoader";
import ResponseModal from "../../../components/ResponseModal";
import { useAuth } from "../../../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] =
    useState<"success" | "error" | "info">("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");


  // ================= LOGIN =================
  const handleLogin = async () => {
  if (!email || !password) {
    setModalType("error");
    setModalTitle("Missing Fields");
    setModalMessage("Email and password are required");
    setModalVisible(true);
    return;
  }

  try {
    setLoading(true);

    const deviceInfo = `${Device.brand || "Unknown"} ${
      Device.modelName || ""
    } (${Device.osName} ${Device.osVersion})`;

    const user = await login(email, password, deviceInfo);

    console.log("✅ login-user-Data:", user);

    setModalType("success");
    setModalTitle("Login Successful");
    setModalMessage(`Welcome back ${user?.name || ""}`);
    setModalVisible(true);
  } catch (err: any) {
    const response = err?.response?.data;

    if (response?.status === "ALREADY_LOGGED_IN") {
      setModalType("error");
      setModalTitle("Account Already Active");
      setModalMessage(
        `This account is already active on:\n\n` +
          `${response.activeDevice}\n\n` +
          `Last Login: ${new Date(
            response.lastLogin
          ).toLocaleString()}`
      );
      setModalVisible(true);
      return;
    }

    const message =
      response?.message ||
      response?.error ||
      err?.message ||
      "Login failed";

    setModalType("error");
    setModalTitle("Login Failed");
    setModalMessage(message);
    setModalVisible(true);
  } finally {
    setLoading(false);
  }
};

  // ================= HANDLE MODAL CLOSE =================
 const handleCloseModal = () => {
  setModalVisible(false);

  if (modalType === "success") {
    console.log("🚀 Redirecting to root...");
    router.replace("/");
  }
};

  // ================= AUTO CLOSE =================
  useEffect(() => {
    if (modalVisible && modalType === "success") {
      const timer = setTimeout(() => {
        handleCloseModal();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [modalVisible, modalType]);

  return (
    <>
      <View
        style={styles.container}
        pointerEvents={loading ? "none" : "auto"}
      >
        <StatusBar style="dark" />

        <View style={styles.card}>
          <Image
            source={require("../../../assets/images/splash/clockee_logo.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue to Clockee
          </Text>

          {/* EMAIL */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#64748B"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              editable={!loading}
            />
          </View>

          {/* PASSWORD */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#64748B"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="********"
              editable={!loading}
            />
            <Pressable
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={20}
                color="#64748B"
              />
            </Pressable>
          </View>

          {/* FORGOT PASSWORD */}
          <View style={styles.options}>
            <Pressable
              onPress={() =>
                router.push("/auth/generalAuth/Forgot-password")
              }
            >
              <Text style={styles.forgot}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          {/* LOGIN BUTTON */}
          <Pressable
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ClockLoader size={22} color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                Sign In
              </Text>
            )}
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ClockLoader size={70} color="#0EA5E9" />
            <Text style={styles.loadingText}>
              Signing you in…
            </Text>
          </View>
        )}
      </View>

      <ResponseModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </>
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
    marginBottom: 12,
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
    marginTop: 12,
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
    color: "#0F172A",
  },
  options: {
    alignItems: "flex-end",
    marginTop: 14,
  },
  forgot: {
    fontSize: 13,
    color: "#0EA5E9",
    fontWeight: "500",
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
});
