// ======================= OtpScreen.tsx =======================

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

// Replace this with your backend verification later.
const CORRECT_OTP = "1234";

export default function OtpScreen() {
  const router = useRouter();

  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill("")
  );

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [timer, setTimer] =
    useState(RESEND_SECONDS);

  const [canResend, setCanResend] =
    useState(false);

  const shakeAnim =
    useRef(new Animated.Value(0)).current;

  const inputs = useRef<
    Array<TextInput | null>
  >([]);

  const verificationTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const navigationTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const enteredOtp = otp.join("");
  const isComplete =
    enteredOtp.length === OTP_LENGTH;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),

      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),

      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),

      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    return () => {
      if (verificationTimeout.current) {
        clearTimeout(
          verificationTimeout.current
        );
      }

      if (navigationTimeout.current) {
        clearTimeout(
          navigationTimeout.current
        );
      }
    };
  }, []);

  /*
   * Auto-submit after all digits are entered.
   */
  useEffect(() => {
    if (!isComplete || verifying || success) {
      return;
    }

    Keyboard.dismiss();

    if (enteredOtp !== CORRECT_OTP) {
      setError(true);
      shake();
      return;
    }

    setError(false);
    setSuccess(true);

    verificationTimeout.current =
      setTimeout(() => {
        setVerifying(true);
      }, 350);

    navigationTimeout.current =
      setTimeout(() => {
        setVerifying(false);

        router.replace(
          "/dashboard/staffDashboard/clockIn/location"
        );
      }, 2200);
  }, [
    enteredOtp,
    isComplete,
    verifying,
    success,
    shake,
    router,
  ]);

  const handleChange = (
    value: string,
    index: number
  ) => {
    const digitsOnly = value.replace(
      /[^0-9]/g,
      ""
    );

    setError(false);

    /*
     * Supports pasting a complete OTP.
     */
    if (digitsOnly.length > 1) {
      const pastedOtp = digitsOnly
        .slice(0, OTP_LENGTH)
        .split("");

      const nextOtp = Array(OTP_LENGTH)
        .fill("")
        .map(
          (_, itemIndex) =>
            pastedOtp[itemIndex] || ""
        );

      setOtp(nextOtp);

      const focusIndex = Math.min(
        pastedOtp.length,
        OTP_LENGTH - 1
      );

      inputs.current[focusIndex]?.focus();

      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = digitsOnly.slice(0, 1);

    setOtp(nextOtp);

    if (
      digitsOnly &&
      index < OTP_LENGTH - 1
    ) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    key: string,
    index: number
  ) => {
    if (
      key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      const nextOtp = [...otp];
      nextOtp[index - 1] = "";

      setOtp(nextOtp);
      setError(false);

      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;

    setOtp(Array(OTP_LENGTH).fill(""));
    setError(false);
    setSuccess(false);
    setVerifying(false);
    setTimer(RESEND_SECONDS);
    setCanResend(false);

    inputs.current[0]?.focus();

    /*
     * Replace this with your real resend API call.
     */
    console.log("OTP resent");
  };

  const getInputStyle = () => {
    if (error) {
      return styles.otpInputError;
    }

    if (success) {
      return styles.otpInputSuccess;
    }

    return styles.otpInputDefault;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerEyebrow}>
              ATTENDANCE SECURITY
            </Text>

            <Text style={styles.headerTitle}>
              Verification
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* MAIN CONTENT */}

        <View style={styles.content}>
          <View style={styles.heroIcon}>
            <View style={styles.heroIconInner}>
              <Ionicons
                name="keypad-outline"
                size={42}
                color={COLORS.primary}
              />
            </View>
          </View>

          <Text style={styles.title}>
            Enter confirmation code
          </Text>

          <Text style={styles.subtitle}>
            Enter the 4-digit code provided by your
            supervisor to continue clock-in.
          </Text>

          <View style={styles.securityPill}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={COLORS.success}
            />

            <Text style={styles.securityPillText}>
              Secure attendance verification
            </Text>
          </View>

          {/* OTP CARD */}

          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>
              CONFIRMATION CODE
            </Text>

            <Animated.View
              style={[
                styles.otpRow,
                {
                  transform: [
                    {
                      translateX: shakeAnim,
                    },
                  ],
                },
              ]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(reference) => {
                    inputs.current[index] =
                      reference;
                  }}
                  value={digit}
                  maxLength={OTP_LENGTH}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  selectTextOnFocus
                  style={[
                    styles.otpInput,
                    getInputStyle(),
                  ]}
                  onChangeText={(value) =>
                    handleChange(value, index)
                  }
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(
                      nativeEvent.key,
                      index
                    )
                  }
                  editable={!verifying}
                />
              ))}
            </Animated.View>

            {error && (
              <View style={styles.messageRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={COLORS.danger}
                />

                <Text style={styles.errorText}>
                  The code is incorrect. Please try again.
                </Text>
              </View>
            )}

            {success && (
              <View style={styles.messageRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={COLORS.success}
                />

                <Text style={styles.successText}>
                  Code confirmed successfully.
                </Text>
              </View>
            )}

            {!error && !success && (
              <Text style={styles.otpHint}>
                Use the code provided for today’s attendance.
              </Text>
            )}
          </View>

          {/* RESEND */}

          <View style={styles.resendSection}>
            <Text style={styles.resendQuestion}>
              Haven’t received the code?
            </Text>

            <Pressable
              style={[
                styles.resendButton,
                !canResend &&
                  styles.resendButtonDisabled,
              ]}
              disabled={!canResend || verifying}
              onPress={handleResend}
            >
              <Ionicons
                name={
                  canResend
                    ? "refresh-outline"
                    : "time-outline"
                }
                size={17}
                color={
                  canResend
                    ? COLORS.primary
                    : COLORS.subtle
                }
              />

              <Text
                style={[
                  styles.resendText,
                  !canResend &&
                    styles.resendTextDisabled,
                ]}
              >
                {canResend
                  ? "Resend code"
                  : `Resend in ${formatTimer(timer)}`}
              </Text>
            </Pressable>
          </View>

          {/* FOOTER NOTE */}

          <View style={styles.footerNote}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={COLORS.primary}
            />

            <Text style={styles.footerText}>
              Never share your attendance verification code with anyone.
            </Text>
          </View>
        </View>

        {/* VERIFYING MODAL */}

        <Modal
          transparent
          visible={verifying}
          animationType="fade"
          onRequestClose={() => undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.verifyCard}>
              <View style={styles.verifyIcon}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.verifyTitle}>
                Verifying your code
              </Text>

              <Text style={styles.verifyText}>
                Checking your code and preparing location verification.
              </Text>

              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>

              <Text style={styles.verifyHint}>
                Please keep the app open
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#0284C7",
  primaryDark: "#0369A1",
  primaryLight: "#E0F2FE",
  success: "#047857",
  successLight: "#ECFDF5",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerTitle: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  heroIcon: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#BAE6FD",
    borderRadius: 52,
  },

  heroIconInner: {
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    borderRadius: 41,
  },

  title: {
    marginTop: 22,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 315,
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  securityPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: COLORS.successLight,
    borderRadius: 20,
  },

  securityPillText: {
    marginLeft: 5,
    color: COLORS.success,
    fontSize: 9,
    fontWeight: "900",
  },

  otpCard: {
    width: "100%",
    marginTop: 25,
    padding: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
  },

  otpLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  otpInput: {
    width: 58,
    height: 62,
    color: COLORS.text,
    borderWidth: 1.5,
    borderRadius: 15,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    backgroundColor: "#F8FAFC",
  },

  otpInputDefault: {
    borderColor: COLORS.border,
  },

  otpInputError: {
    backgroundColor: COLORS.dangerLight,
    borderColor: "#FCA5A5",
    color: COLORS.danger,
  },

  otpInputSuccess: {
    backgroundColor: COLORS.successLight,
    borderColor: "#86EFAC",
    color: COLORS.success,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
  },

  errorText: {
    marginLeft: 5,
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: "700",
  },

  successText: {
    marginLeft: 5,
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "700",
  },

  otpHint: {
    marginTop: 13,
    color: COLORS.subtle,
    fontSize: 10,
    textAlign: "center",
  },

  resendSection: {
    alignItems: "center",
    marginTop: 22,
  },

  resendQuestion: {
    color: COLORS.muted,
    fontSize: 11,
  },

  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    height: 44,
    marginTop: 9,
    paddingHorizontal: 15,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 13,
  },

  resendButtonDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: COLORS.border,
  },

  resendText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  resendTextDisabled: {
    color: COLORS.subtle,
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    paddingHorizontal: 15,
    paddingBottom: 22,
  },

  footerText: {
    flex: 1,
    marginLeft: 6,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },

  verifyCard: {
    alignItems: "center",
    width: 295,
    padding: 25,
    backgroundColor: COLORS.white,
    borderRadius: 23,
  },

  verifyIcon: {
    width: 67,
    height: 67,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 21,
  },

  verifyTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  verifyText: {
    maxWidth: 235,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },

  progressTrack: {
    width: "100%",
    height: 6,
    marginTop: 20,
    overflow: "hidden",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
  },

  progressFill: {
    width: "65%",
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },

  verifyHint: {
    marginTop: 10,
    color: COLORS.subtle,
    fontSize: 9,
  },
});
