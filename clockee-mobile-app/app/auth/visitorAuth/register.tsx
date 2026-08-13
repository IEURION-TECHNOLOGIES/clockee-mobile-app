import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ClockLoader from "../../../components/ClockLoader";
import ResponseModal from "../../../components/ResponseModal";
import { registerVisitor } from "../../../services/authService";

/**
 * UI LABEL -> VALUE SENT TO BACKEND
 */
const ORG_OPTIONS = [
  { label: "School / Institution", value: "school" },
  { label: "Company / Business", value: "company" },
];

export default function RegisterScreen() {
  const router = useRouter();

  // -------------------------------
  // 🔐 ROLE GUARD (LOGIC ONLY)
  // -------------------------------
  useEffect(() => {
    const guardRoute = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");

        // Admin & Staff must never see this screen
        if (role === "admin" || role === "staff") {
          router.replace("/auth/generalAuth/Login");
        }
      } catch {
        // silently ignore
      }
    };

    guardRoute();
  }, []);

  // -------------------------------
  // FORM STATE
  // -------------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");

  const [organization, setOrganization] = useState(ORG_OPTIONS[0]);
  const [orgOpen, setOrgOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // -------------------------------
  // MODAL STATE
  // -------------------------------
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] =
    useState<"success" | "error" | "info">("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showModal = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // -------------------------------
  // SUBMIT HANDLER
  // -------------------------------
  const handleRegister = async () => {
    if (!name || !email || !phone || !orgName) {
      showModal("error", "Validation Error", "All fields are required");
      return;
    }

    try {
      setLoading(true);

      await registerVisitor({
        name,
        email,
        phone,
        companyName: orgName,
        role: "admin",
        interest: organization.value,
      });

      showModal(
        "success",
        "Request Submitted",
        "Our team will contact you shortly.",
      );

      // ✅ show success once, then move on
      setTimeout(() => {
        setModalVisible(false);
        router.replace(
          "/dashboard/visitorDashboard/VisitorStatusScreen",
        );
      }, 1200);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      showModal("error", "Error", message);
    } finally {
      setLoading(false);
    }
  };

  const isSchool = organization.value === "school";

  // -------------------------------
  // UI (UNCHANGED)
  // -------------------------------
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraScrollHeight={40}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />

      <View style={styles.card}>
        <Image
          source={require("../../../assets/images/splash/clockee_logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Request a Demo</Text>
        <Text style={styles.subtitle}>
          Tell us a little about yourself and your organization
        </Text>

        {/* NAME */}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#64748B" />
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="John Doe"
          />
        </View>

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#64748B" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* PHONE */}
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={18} color="#64748B" />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="+234..."
            keyboardType="phone-pad"
          />
        </View>

        {/* ORG TYPE */}
        <Text style={styles.label}>
          What best describes your organization?
        </Text>

        <Pressable
          style={styles.inputWrapper}
          onPress={() => setOrgOpen(!orgOpen)}
        >
          <Ionicons name="layers-outline" size={18} color="#64748B" />
          <Text style={[styles.input, { color: "#0F172A" }]}>
            {organization.label}
          </Text>
          <Ionicons
            name={orgOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#64748B"
          />
        </Pressable>

        {orgOpen && (
          <View style={styles.dropdown}>
            {ORG_OPTIONS.map((item) => (
              <Pressable
                key={item.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setOrganization(item);
                  setOrgOpen(false);
                }}
              >
                <Text style={styles.dropdownText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ORG NAME */}
        <Text style={styles.label}>
          {isSchool ? "School Name" : "Company Name"}
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={18} color="#64748B" />
          <TextInput
            value={orgName}
            onChangeText={setOrgName}
            style={styles.input}
            placeholder={
              isSchool
                ? "e.g. Bright Stars Academy"
                : "e.g. Devad Group"
            }
          />
        </View>

        {/* SUBMIT */}
        <Pressable
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ClockLoader size={22} color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Submit Request</Text>
          )}
        </Pressable>
      </View>

      <ResponseModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ClockLoader size={70} color="#0EA5E9" />
          <Text style={styles.loadingText}>
            Sending demo request…
          </Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 120,
    backgroundColor: "#F8FAFC",
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
    marginTop: 12,
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
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownText: {
    fontSize: 14,
    color: "#0F172A",
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
