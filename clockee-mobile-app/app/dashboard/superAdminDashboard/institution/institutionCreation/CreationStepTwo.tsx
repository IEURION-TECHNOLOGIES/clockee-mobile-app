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

export default function CreateInstitutionStepTwo() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = ownerName && ownerEmail && ownerPassword;

 const handleSubmit = async () => {
  if (!isValid || loading) return;

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

      // ✅ owner as OBJECT (FIXED)
      ownerData: {
        name: ownerName,
        email: ownerEmail,
        password: ownerPassword,
      },
    };

    console.log("FINAL PAYLOAD:", payload);

    await registerAdmin(payload);

    router.replace("/dashboard/superAdminDashboard/institution/institutionList");
  } catch (err: any) {
  console.log("FULL ERROR:", err?.response); // 🔥 SEE EVERYTHING

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} />
          </Pressable>

          <Text style={styles.title}>Owner Info</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <TextInput
            placeholder="Owner Name"
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
          />

          <TextInput
            placeholder="Owner Email"
            style={styles.input}
            value={ownerEmail}
            onChangeText={setOwnerEmail}
          />

          <TextInput
            placeholder="Owner Password"
            style={styles.input}
            secureTextEntry
            value={ownerPassword}
            onChangeText={setOwnerPassword}
          />
        </View>

        {/* SUBMIT */}
        <Pressable
          style={[styles.button, !isValid && styles.disabled]}
          disabled={!isValid}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating..." : "Create"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  header: { flexDirection: "row", marginBottom: 20, alignItems: "center", gap: 10 },
  title: { fontSize: 18, fontWeight: "700" },
  form: { gap: 14 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 30,
    height: 50,
    backgroundColor: "#0EA5E9",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.5 },
});

