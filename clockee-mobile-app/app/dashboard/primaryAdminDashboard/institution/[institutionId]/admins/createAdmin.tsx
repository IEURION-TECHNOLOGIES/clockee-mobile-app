import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ROLES = ["Primary Admin", "Admin"] as const;
const GENDERS = ["Male", "Female"] as const;
const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"] as const;

export default function AssignInstitutionAdmin() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    staffId: "",
    department: "",
    branch: "",
    gender: "",
    employmentType: "",
    role: "",
    dateEmployed: null as Date | null,
  });

  const [picker, setPicker] = useState<"role" | "gender" | "employment" | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (Object.values(admin).some((v) => !v)) {
      return "All fields are required";
    }
    if (!/\S+@\S+\.\S+/.test(admin.email)) {
      return "Invalid email address";
    }
    if (admin.phone.length < 10) {
      return "Invalid phone number";
    }
    return "";
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");

    const payload = {
      institutionId,
      admin: {
        ...admin,
        dateEmployed: admin.dateEmployed?.toISOString(),
        status: "active",
        createdAt: new Date().toISOString(),
      },
    };

    console.log("CREATE ADMIN PAYLOAD:", payload);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Assign Institution Admin</Text>
      </View>

      {/* FORM */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input label="Admin Name" value={admin.name} onChange={(v) => setAdmin({ ...admin, name: v })} />
        <Input label="Email" value={admin.email} keyboard="email-address" onChange={(v) => setAdmin({ ...admin, email: v })} />

        <Row>
          <Input half label="Phone" value={admin.phone} keyboard="phone-pad" onChange={(v) => setAdmin({ ...admin, phone: v })} />
          <Input half label="Staff ID" value={admin.staffId} onChange={(v) => setAdmin({ ...admin, staffId: v })} />
        </Row>

        <Row>
          <Select half label="Gender" value={admin.gender} onPress={() => setPicker("gender")} />
          <Select half label="Employment Type" value={admin.employmentType} onPress={() => setPicker("employment")} />
        </Row>

        <Row>
          <Input half label="Department" value={admin.department} onChange={(v) => setAdmin({ ...admin, department: v })} />
          <Input half label="Branch" value={admin.branch} onChange={(v) => setAdmin({ ...admin, branch: v })} />
        </Row>

        {/* DATE PICKER */}
        <Text style={styles.label}>Date of Employment</Text>
        <Pressable style={styles.select} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.selectText, admin.dateEmployed && styles.activeText]}>
            {admin.dateEmployed
              ? admin.dateEmployed.toDateString()
              : "Select date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#64748B" />
        </Pressable>

        <Select label="Role" value={admin.role} onPress={() => setPicker("role")} />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Assign Admin</Text>
        </Pressable>
      </View>

      {/* DATE PICKER MODAL */}
      {showDatePicker && (
        <DateTimePicker
          value={admin.dateEmployed || new Date()}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setAdmin({ ...admin, dateEmployed: date });
          }}
        />
      )}

      {/* SELECT PICKERS */}
      {picker && (
        <PickerSheet
          title={`Select ${picker}`}
          options={
            picker === "role"
              ? ROLES
              : picker === "gender"
              ? GENDERS
              : EMPLOYMENT_TYPES
          }
          value={
            picker === "role"
              ? admin.role
              : picker === "gender"
              ? admin.gender
              : admin.employmentType
          }
          onSelect={(value) => {
            setAdmin({
              ...admin,
              ...(picker === "role" && { role: value }),
              ...(picker === "gender" && { gender: value }),
              ...(picker === "employment" && { employmentType: value }),
            });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </View>
  );
}

/* ================= COMPONENTS ================= */

const Row = ({ children }: any) => (
  <View style={styles.row}>{children}</View>
);

const Input = ({ label, value, onChange, keyboard = "default", half }: any) => (
  <View style={half && { flex: 1 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      keyboardType={keyboard}
      onChangeText={onChange}
    />
  </View>
);

const Select = ({ label, value, onPress, half }: any) => (
  <View style={half && { flex: 1 }}>
    <Text style={styles.label}>{label}</Text>
    <Pressable style={styles.select} onPress={onPress}>
      <Text style={[styles.selectText, value && styles.activeText]}>
        {value || "Select"}
      </Text>
      <Ionicons name="chevron-down" size={20} color="#64748B" />
    </Pressable>
  </View>
);

const PickerSheet = ({ title, options, value, onSelect, onClose }: any) => (
  <View style={styles.overlay}>
    <View style={styles.sheet}>
      <Text style={styles.sheetTitle}>{title}</Text>
      {options.map((opt: string) => (
        <Pressable key={opt} style={styles.roleItem} onPress={() => onSelect(opt)}>
          <Text style={styles.roleText}>{opt}</Text>
          {value === opt && <Ionicons name="checkmark-circle" size={18} color="#22C55E" />}
        </Pressable>
      ))}
      <Pressable style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 20, paddingTop: 60 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, height: 48, paddingHorizontal: 12, marginBottom: 14 },
  select: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, height: 48, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  selectText: { color: "#64748B" },
  activeText: { color: "#0F172A" },
  error: { color: "#DC2626", fontSize: 12, marginTop: 10 },
  row: { flexDirection: "row", gap: 12 },
  footer: { paddingVertical: 14 },
  button: { backgroundColor: "#0284C7", height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  overlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetTitle: { fontSize: 15, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  roleItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 },
  roleText: { fontWeight: "600" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { fontWeight: "700", color: "#64748B" },
});