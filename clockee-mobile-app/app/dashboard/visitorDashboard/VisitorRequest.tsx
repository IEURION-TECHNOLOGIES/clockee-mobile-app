import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RequestDemo() {
  const [institution, setInstitution] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");

  /* Animations */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const submitDemo = () => {
    if (!institution || !contact) {
      alert("Please fill all required fields");
      return;
    }

    alert("Demo Requested 🎉\nOur team will contact you shortly.");

    setInstitution("");
    setContact("");
    setNote("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="dark" />

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* HEADER */}
          <Text style={styles.title}>Request a Demo</Text>
          <Text style={styles.subtitle}>
            Tell us about your institution and we’ll walk you through Clockee.
          </Text>

          {/* FORM CARD */}
          <View style={styles.card}>
            {/* INSTITUTION */}
            <Text style={styles.label}>Institution Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Bright Future Academy"
                value={institution}
                onChangeText={setInstitution}
              />
            </View>

            {/* CONTACT */}
            <Text style={styles.label}>Email or Phone *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="you@example.com / +123456789"
                value={contact}
                onChangeText={setContact}
                keyboardType="email-address"
              />
            </View>

            {/* NOTE */}
            <Text style={styles.label}>Additional Note (Optional)</Text>
            <View style={[styles.inputWrapper, styles.textArea]}>
              <Ionicons name="chatbox-outline" size={18} color="#64748B" />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Tell us about your staff size or needs..."
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>

            {/* SUBMIT */}
            <Pressable style={styles.button} onPress={submitDemo}>
              <Text style={styles.buttonText}>Submit Demo Request</Text>
            </Pressable>
          </View>

          {/* INFO */}
          <Text style={styles.footerText}>
            A Clockee representative will reach out within 24 hours.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
    paddingTop: 60,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    elevation: 3,
  },

  label: {
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 6,
    marginTop: 14,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },

  textArea: {
    height: 100,
    alignItems: "flex-start",
    paddingTop: 10,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0F172A",
  },

  button: {
    backgroundColor: "#0EA5E9",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  footerText: {
    marginTop: 18,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
});
