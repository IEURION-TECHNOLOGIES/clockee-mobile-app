import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { useInstitutionForm } from "@/context/InstitutionFormContext";
import { registerAdmin } from "@/services/superAdminServices";

export default function CreateInstitutionStepTwo() {
  const router = useRouter();
  const { form, updateForm } = useInstitutionForm();

  const { contact, basic, location } = form;
  const { email, phone, address } = contact;
  const { institutionName, institutionType } = basic;
  const { country, state, city } = location;

  const countryName = country?.name || "";
  const stateName = state?.name || "";
  const cityName = city?.name || "";

  const [loading, setLoading] = useState(false);

  const isFormComplete =
    !!institutionName &&
    !!institutionType &&
    !!email &&
    !!phone &&
    !!address &&
    !!countryName &&
    !!stateName &&
    !!cityName;

  const handleSubmit = async () => {
    if (!isFormComplete || loading) return;

    try {
      setLoading(true);

      // ✅ EXACT BACKEND MATCH
      const payload = {
        name: institutionName,
        type: institutionType.toLowerCase(), // 🔥 ENUM FIX
        address,
        email,
        phone,
        country: countryName,
        state: stateName,
        city: cityName,
      };

      console.log("CREATE INSTITUTION PAYLOAD:", payload);

      const res = await registerAdmin(payload);

      console.log("INSTITUTION CREATE RESPONSE:", res.data);

      router.push(
        "/dashboard/superAdminDashboard/Overview"
      );
    } catch (error: any) {
      console.error("INSTITUTION CREATE ERROR:", error.message || error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Unable to create institution"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#0F172A" />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Create New Institution</Text>
            <Text style={styles.subtitle}>
              Set up a new institution in just a few steps
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.completedDot]} />
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.stepTitle}>Contact</Text>
        <Text style={styles.stepSubtitle}>Reach Info</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Contact Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) =>
              updateForm("contact", { email: text })
            }
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.input}>
            <TextInput
              style={{ flex: 1 }}
              value={phone}
              onChangeText={(text) =>
                updateForm("contact", { phone: text })
              }
            />
            <Ionicons name="call-outline" size={18} color="#64748B" />
          </View>

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={address}
            onChangeText={(text) =>
              updateForm("contact", { address: text })
            }
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!isFormComplete || loading}
          style={[
            styles.button,
            (!isFormComplete || loading) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating..." : "Continue"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  header: {
     flexDirection: "row", marginBottom: 24 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4 },
  progressContainer: { flexDirection: "row", marginBottom: 20 },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
    marginRight: 10,
  },
  completedDot: { backgroundColor: "#22C55E" },
  activeDot: { backgroundColor: "#0EA5E9" },
  stepTitle: { fontSize: 16, fontWeight: "700" },
  stepSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  form: { marginBottom: 40 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  textArea: { height: 72, paddingTop: 10 },
  button: {
    backgroundColor: "#35a8e6ff",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
