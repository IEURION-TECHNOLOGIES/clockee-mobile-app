import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Device from "expo-device";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// import DevResetOnboarding from "@/components/DevResetOnboarding";
import ClockLoader from "../../../components/ClockLoader";
import ResponseModal from "../../../components/ResponseModal";
import { useAuth } from "../../../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [modalType, setModalType] =
    useState<"success" | "error" | "info">(
      "info"
    );

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [formError, setFormError] =
    useState("");

  /* ================= LOGIN ================= */

  const handleLogin = async () => {
    setFormError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setFormError(
        "Email and password are required."
      );
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setFormError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      const deviceInfo = `${Device.brand || "Unknown"} ${
        Device.modelName || "Device"
      } (${Device.osName} ${Device.osVersion})`;

      const user = await login(
  trimmedEmail.toLowerCase(),
  password,
  deviceInfo
);

console.log(
  "[LoginScreen] User returned from AuthContext:",
  {
    id: user?.id,
    name: user?.name,
    branchId: user?.branchId,
    institutionId:
      user?.institutionId,
    role: user?.role,
    dashboardType:
      user?.dashboardType,
  }
);

      console.log("Login user data:", user);

      setModalType("success");
      setModalTitle("Login successful");
      setModalMessage(
        `Welcome back${
          user?.name ? `, ${user.name}` : ""
        }.`
      );
      setModalVisible(true);
    } catch (loginError: any) {
      console.log(
        "Login error:",
        loginError?.response?.data ||
          loginError
      );

      const response =
        loginError?.response?.data;

      if (
        response?.status ===
        "ALREADY_LOGGED_IN"
      ) {
        const activeDevice =
          response.activeDevice ||
          "Another device";

        const lastLogin = response.lastLogin
          ? new Date(
              response.lastLogin
            ).toLocaleString()
          : "Unknown";

        setModalType("error");
        setModalTitle("Account already active");
        setModalMessage(
          `This account is already active on:\n\n` +
            `${activeDevice}\n\n` +
            `Last login: ${lastLogin}`
        );
        setModalVisible(true);
        return;
      }

      const message =
        response?.message ||
        response?.error ||
        loginError?.message ||
        "Login failed. Please try again.";

      setModalType("error");
      setModalTitle("Login failed");
      setModalMessage(message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  /* ================= MODAL ================= */

  const handleCloseModal = () => {
    setModalVisible(false);

    if (modalType === "success") {
      router.replace("/");
    }
  };

  useEffect(() => {
    if (
      modalVisible &&
      modalType === "success"
    ) {
      const timer = setTimeout(() => {
        handleCloseModal();
      }, 1400);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [modalVisible, modalType]);

  /* ================= UI ================= */

  return (
    <View style={styles.screen}>
  <StatusBar style="light" />

  <LinearGradient
    colors={["#075985", "#0284C7", "#0EA5E9"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.backgroundGradient}
  >
    <View style={styles.backgroundCircleOne} />
    <View style={styles.backgroundCircleTwo} />

    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 0 : 20
      }
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          contentInsetAdjustmentBehavior="automatic"
        >
            {/* ================= BRAND ================= */}

            <View style={styles.brandSection}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../../assets/images/splash/clockee_logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.brandName}>
                Clockee
              </Text>

              <Text style={styles.brandSubtitle}>
                Smart workplace attendance
              </Text>
            </View>

            {/* ================= LOGIN CARD ================= */}

            <View style={styles.loginCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>
                    Welcome back
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    Sign in to continue to your account.
                  </Text>
                </View>

                <View style={styles.cardHeaderIcon}>
                  <Ionicons
                    name="log-in-outline"
                    size={22}
                    color="#0284C7"
                  />
                </View>
              </View>

              {/* EMAIL */}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Email address
                </Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color="#0284C7"
                    />
                  </View>

                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);

                      if (formError) {
                        setFormError("");
                      }
                    }}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* PASSWORD */}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Password
                </Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#0284C7"
                    />
                  </View>

                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);

                      if (formError) {
                        setFormError("");
                      }
                    }}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    editable={!loading}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />

                  <Pressable
                    style={styles.passwordButton}
                    onPress={() =>
                      setShowPassword(
                        (previousValue) =>
                          !previousValue
                      )
                    }
                    disabled={loading}
                    hitSlop={8}
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
              </View>

              {/* FORGOT PASSWORD */}

              <View style={styles.optionsRow}>
                <View style={styles.rememberInfo}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={15}
                    color="#64748B"
                  />

                  <Text style={styles.rememberText}>
                    Secure sign in
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    router.push(
                      "/auth/generalAuth/Forgot-password"
                    )
                  }
                  disabled={loading}
                >
                  <Text style={styles.forgotText}>
                    Forgot password?
                  </Text>
                </Pressable>
              </View>

              {/* FORM ERROR */}

              {formError.length > 0 && (
                <View style={styles.formErrorCard}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={19}
                    color="#DC2626"
                  />

                  <Text style={styles.formErrorText}>
                    {formError}
                  </Text>
                </View>
              )}

              {/* LOGIN BUTTON */}

              <Pressable
                style={[
                  styles.loginButton,
                  loading &&
                    styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ClockLoader
                    size={23}
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>
                      Sign in
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>

              <View style={styles.securityNote}>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color="#64748B"
                />

                <Text style={styles.securityNoteText}>
                  Your account information is securely protected.
                </Text>
              </View>
            </View>

            <Text style={styles.footerText}>
              Manage attendance. Empower your workplace.
            </Text>
            </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </LinearGradient>

      {/* ================= LOADING OVERLAY ================= */}

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ClockLoader
              size={65}
              color="#0284C7"
            />

            <Text style={styles.loadingTitle}>
              Signing you in
            </Text>

            <Text style={styles.loadingText}>
              Please wait while we verify your account.
            </Text>
          </View>
        </View>
      )}

      {/* <DevResetOnboarding /> */}

      {/* ================= RESPONSE MODAL ================= */}

      <ResponseModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#075985",
  },

  backgroundGradient: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },

  backgroundCircleOne: {
    position: "absolute",
    width: 280,
    height: 280,
    top: -135,
    right: -90,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 150,
  },

  backgroundCircleTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    bottom: 70,
    left: -100,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 100,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 42,
    paddingBottom: 28,
  },

  brandSection: {
    alignItems: "center",
    marginBottom: 25,
  },

  logoWrapper: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  logo: {
    width: 49,
    height: 49,
  },

  brandName: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  brandSubtitle: {
    marginTop: 4,
    color: "#BAE6FD",
    fontSize: 12,
    fontWeight: "600",
  },

  loginCard: {
    padding: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 25,
    elevation: 9,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 17,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  cardTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
  },

  cardSubtitle: {
    maxWidth: 245,
    marginTop: 5,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
  },

  cardHeaderIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 14,
  },

  fieldGroup: {
    marginBottom: 17,
  },

  label: {
    marginBottom: 8,
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 55,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
  },

  inputIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor: "#E0F2FE",
    borderRadius: 11,
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
  },

  passwordButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -2,
    marginBottom: 16,
  },

  rememberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  rememberText: {
    marginLeft: 5,
    color: "#64748B",
    fontSize: 11,
  },

  forgotText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "800",
  },

  formErrorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    padding: 11,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
  },

  formErrorText: {
    flex: 1,
    marginLeft: 7,
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 16,
  },

  loginButton: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284C7",
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#0284C7",
    shadowOpacity: 0.25,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    marginRight: 9,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  securityNoteText: {
    marginLeft: 5,
    color: "#64748B",
    fontSize: 10,
  },

  footerText: {
    marginTop: 22,
    color: "#E0F2FE",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,89,133,0.86)",
  },

  loadingCard: {
    alignItems: "center",
    minWidth: 245,
    paddingHorizontal: 24,
    paddingVertical: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    elevation: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  loadingTitle: {
    marginTop: 15,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },

  loadingText: {
    maxWidth: 210,
    marginTop: 5,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
