import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Keyboard,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export default function OtpScreen() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);


  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputs = useRef<(TextInput | null)[]>([]);

  const CORRECT_OTP = "1234";

  /* ---------- SHAKE ---------- */
  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  /* ---------- OTP CHANGE ---------- */
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleResend = () => {
  if (!canResend) return;

  setTimer(30);
  setCanResend(false);
  setOtp(["", "", "", ""]);
  setError(false);
  setSuccess(false);

  inputs.current[0]?.focus();

  console.log("OTP resent"); // replace with backend call
};

  
  useEffect(() => {
  if (timer === 0) {
    setCanResend(true);
    return;
  }

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer]);


  /* ---------- AUTO SUBMIT ---------- */
  useEffect(() => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length === 4) {
      Keyboard.dismiss();

      if (enteredOtp !== CORRECT_OTP) {
        setError(true);
        shake();
        return;
      }

      // ✅ correct OTP
      setSuccess(true);

      // show verifying modal
      setTimeout(() => {
        setVerifying(true);
      }, 400);

      // simulate backend + gps
      setTimeout(() => {
        setVerifying(false);
        router.replace("/dashboard/staffDashboard/clockIn/location");
      }, 2500);
    }
  }, [otp, shake, router]);

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </Pressable>
        </View>
      
      <Text style={styles.title}>Enter confirmation code</Text>

      {/* OTP INPUT */}
      <Animated.View
        style={[
          styles.otpRow,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {otp.map((digit, index) => (
        <TextInput
            key={index}
            ref={(ref) => { inputs.current[index] = ref }}
            value={digit}
            keyboardType="number-pad"
            maxLength={1}
            style={[
            styles.otpBox,
            error && styles.errorBox,
            success && styles.successBox,
            ]}
            onChangeText={(val) => handleChange(val, index)}
            onKeyPress={({ nativeEvent }) => {
            if (
                nativeEvent.key === "Backspace" &&
                otp[index] === "" &&
                index > 0
            ) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputs.current[index - 1]?.focus();
            }
            }}
        />
        ))}

      </Animated.View>
       {error && (
        <Text style={styles.errorText}>Your OTP is incorrect. please try again.</Text>
      )}
      <Text style={styles.infoText}>Haven’t received code yet?</Text>

<Pressable
  style={[
    styles.resendBtn,
    !canResend && styles.resendDisabled,
  ]}
  disabled={!canResend}
  onPress={handleResend}
>
  <Text
    style={[
      styles.resendText,
      !canResend && { opacity: 0.5 },
    ]}
  >
    {canResend ? "Resend code" : `Resend in 00:${timer}`}
  </Text>
</Pressable>
        {/* ERROR MESSAGE */}

      {/* VERIFYING MODAL */}
      <Modal transparent visible={verifying} animationType="fade">
        <View style={styles.verifyOverlay}>
          <View style={styles.verifyCard}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.verifyTitle}>Verifying Code</Text>
            <Text style={styles.verifyText}>
              Checking GPS location and validating
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6EEF3",
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    marginTop: 10,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 10,
  },

  email: {
    fontWeight: "600",
    color: "#0F172A",
  },

  changeEmail: {
    color: "#0EA5E9",
    textAlign: "center",
    marginTop: 6,
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginHorizontal: 10,
  },

  otpBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    backgroundColor: "#fff",
  },

  errorBox: {
    borderColor: "#EF4444",
  },

  successBox: {
    borderColor: "#22C55E",
  },

  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },

  /* VERIFY MODAL */
  verifyOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  verifyCard: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  verifyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
  },

  verifyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },

  infoText: {
  textAlign: "center",
  color: "#64748B",
  marginTop: 28,
},

resendBtn: {
  borderWidth: 1,
  borderColor: "#0EA5E9",
  borderRadius: 28,
  height: 48,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 10,
},

resendDisabled: {
  borderColor: "#CBD5E1",
},

resendText: {
  color: "#0EA5E9",
  fontWeight: "600",
},

});
