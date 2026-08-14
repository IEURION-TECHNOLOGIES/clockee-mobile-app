import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { registerAdmin } from "@/services/superAdminServices";

// Validators
const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password: string) =>
  // At least 6 characters, can be customized
  password.length >= 6;

export default function CreateInstitutionStepTwo() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!ownerName.trim()) {
      newErrors.name = "Owner name is required";
    }

    if (!ownerEmail.trim()) {
      newErrors.email = "Owner email is required";
    } else if (!validateEmail(ownerEmail.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!ownerPassword) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(ownerPassword)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        // ✅ institution
        name: params.name,
        type: params.type,
        address: params.address,
        email: params.email,
        phone: params.phone,
        industry: params.industry,

        // ✅ owner as OBJECT
        ownerData: {
          name: ownerName.trim(),
          email: ownerEmail.trim().toLowerCase(),
          password: ownerPassword,
        },
      };

      console.log("FINAL PAYLOAD:", payload);

      await registerAdmin(payload);

      router.replace(
        "/dashboard/superAdminDashboard/institution/institutionList"
      );
    } catch (err: any) {
      console.log("FULL ERROR:", err?.response);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        JSON.stringify(err?.response?.data) ||
        err.message ||
        "Something went wrong";

      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field: string) =>
    errors[field] ? (
      <Text style={styles.errorText}>{errors[field]}</Text>
    ) : null;

  const isButtonEnabled =
    ownerName.trim() &&
    validateEmail(ownerEmail.trim()) &&
    validatePassword(ownerPassword) &&
    !loading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="dark" />

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Owner Info</Text>
            <Text style={styles.subtitle}>Step 2 of 2</Text>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* OWNER NAME */}
          <View style={styles.field}>
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              placeholder="e.g. Adaora Johnson"
              style={[
                styles.input,
                errors.name && styles.inputError,
              ]}
              value={ownerName}
              onChangeText={(v) => {
                setOwnerName(v);
                if (errors.name) setErrors((e) => ({ ...e, name: "" }));
              }}
              autoCapitalize="words"
            />
            {renderError("name")}
          </View>

          {/* OWNER EMAIL */}
          <View style={styles.field}>
            <Text style={styles.label}>Owner Email</Text>
            <TextInput
              placeholder="owner@institution.com"
              style={[
                styles.input,
                errors.email && styles.inputError,
              ]}
              value={ownerEmail}
              onChangeText={(v) => {
                setOwnerEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: "" }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {renderError("email")}
          </View>

          {/* OWNER PASSWORD */}
          <View style={styles.field}>
            <Text style={styles.label}>Owner Password</Text>
            <TextInput
              placeholder="At least 6 characters"
              style={[
                styles.input,
                errors.password && styles.inputError,
              ]}
              secureTextEntry
              value={ownerPassword}
              onChangeText={(v) => {
                setOwnerPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: "" }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {renderError("password")}
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <Pressable
          style={[
            styles.button,
            !isButtonEnabled && styles.buttonDisabled,
          ]}
          disabled={!isButtonEnabled}
          onPress={handleSubmit}
        >
          {loading ? (
            <Ionicons name="hourglass-outline" size={22} color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Create Institution</Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            </>
          )}
        </Pressable>

        {/* Extra bottom padding for scroll comfort */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  form: {
    gap: 18,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 2,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#0F172A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 2,
    marginTop: 4,
  },

  button: {
    marginTop: 22,
    height: 54,
    backgroundColor: "#0EA5E9",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
