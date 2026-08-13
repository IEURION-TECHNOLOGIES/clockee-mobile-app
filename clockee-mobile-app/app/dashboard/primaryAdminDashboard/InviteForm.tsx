import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SingleInviteForm() {
  const router = useRouter();

  /* ================= ROUTE PARAMS ================= */
  const params = useLocalSearchParams<{
    name?: string;
    email?: string;
    role?: string;
  }>();

  /* ================= STATE ================= */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Admin");

  const [showRole, setShowRole] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [showModal, setShowModal] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const inviteLink = "https://app.clockee.io/invite";
  const roles = ["Admin", "Staff", "Manager"];

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (params.name) setName(String(params.name));
    if (params.email) setEmail(String(params.email));
    if (params.role) setRole(String(params.role));
  }, [params]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    const e: any = {};

    if (!name || name.trim().length < 3)
      e.name = "Name must be at least 3 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      e.email = "Enter a valid email address";

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone))
      e.phone = "Enter a valid 10-digit phone number";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    setSubmitted(true);
    if (validate()) {
      setShowModal(true);
    }
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert("Copied", "Invite link copied to clipboard");
  };

  /* ================= UI ================= */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Single Invite</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* ===== FORM ===== */}
      <View style={styles.form}>
        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          style={[styles.input, submitted && errors.name && styles.inputError]}
        />
        {submitted && errors.name && (
          <Text style={styles.error}>{errors.name}</Text>
        )}

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="example@email.com"
          style={[styles.input, submitted && errors.email && styles.inputError]}
        />
        {submitted && errors.email && (
          <Text style={styles.error}>{errors.email}</Text>
        )}

        {/* Phone */}
        <Text style={styles.label}>Phone Number</Text>
        <View
          style={[
            styles.phoneBox,
            submitted && errors.phone && styles.inputError,
          ]}
        >
          <View style={styles.flagBox}>
            <Text>🇳🇬 +234</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="8123456789"
            style={styles.phoneInput}
          />
        </View>
        {submitted && errors.phone && (
          <Text style={styles.error}>{errors.phone}</Text>
        )}

        {/* Role */}
        <Text style={styles.label}>Role</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowRole(!showRole)}
        >
          <Text>{role}</Text>
          <Ionicons name="chevron-down" size={18} />
        </TouchableOpacity>

        {showRole && (
          <View style={styles.dropdownList}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.dropdownItem}
                onPress={() => {
                  setRole(r);
                  setShowRole(false);
                }}
              >
                <Text>{r}</Text>
                {r === role && (
                  <Ionicons name="checkmark" size={18} color="#0284C7" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ===== CONTINUE ===== */}
      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      {/* ===== LINK MODAL ===== */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Invite Link</Text>

            <View style={styles.linkBox}>
              <Text style={styles.linkText}>{inviteLink}</Text>
              <TouchableOpacity onPress={copyLink}>
                <Text style={styles.copy}>Copy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text>Send as email</Text>
              <Switch value={sendEmail} onValueChange={setSendEmail} />
            </View>

            <TouchableOpacity
              style={styles.inviteBtn}
              onPress={() => {
                setShowModal(false);
                router.back();
              }}
            >
              <Text style={styles.inviteText}>Send Invite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, marginTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },

  label: { marginTop: 14, fontSize: 13, color: "#334155" },
  form: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
  },
  phoneBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
  },
  flagBox: { padding: 12, backgroundColor: "#F8FAFC" },
  phoneInput: { flex: 1, padding: 12 },

  dropdown: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    marginTop: 6,
  },
  dropdownItem: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  continueBtn: {
    backgroundColor: "#0284C7",
    padding: 14,
    borderRadius: 999,
    alignItems: "center",
    marginVertical: 30,
  },
  continueText: { color: "#fff", fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  modalTitle: { fontWeight: "600" },
  linkBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  linkText: { color: "#334155", flex: 1, marginRight: 10 },
  copy: { color: "#0284C7" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  inviteBtn: {
    backgroundColor: "#0284C7",
    padding: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 20,
  },
  inviteText: { color: "#fff", fontWeight: "600" },

  inputError: { borderColor: "#EF4444" },
  error: { color: "#EF4444", fontSize: 12 },
});