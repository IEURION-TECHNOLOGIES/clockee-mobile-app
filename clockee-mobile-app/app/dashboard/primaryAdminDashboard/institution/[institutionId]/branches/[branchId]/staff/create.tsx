import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
;
import SingleInviteModal from "./invites/SingleInviteModal";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ================= OPTIONS ================= */

const STAFF_ROLES = ["Teacher", "Administration", "Support"] as const;
const GENDERS = ["Male", "Female"] as const;
const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"] as const;

/* ================= MAIN ================= */

export default function CreateStaff() {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false)

  const { institutionId, branchId } = useLocalSearchParams<{
    institutionId: string;
    branchId: string;
  }>();

  const [staff, setStaff] = useState({
    name: "",
    email: "",
    phone: "",
    staffId: "",
    department: "",
    branch: "",
    gender: "",
    employmentType: "",
    role: "",
    subject: "",
    dateEmployed: null as Date | null,
  });

  const [picker, setPicker] =
    useState<"role" | "gender" | "employment" | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");

  /* ================= VALIDATION ================= */

  const validate = () => {
    if (!staff.name || !staff.email || !staff.phone || !staff.role)
      return "Please fill all required fields";

    if (!/\S+@\S+\.\S+/.test(staff.email))
      return "Invalid email address";

    if (staff.phone.length < 10)
      return "Invalid phone number";

    if (staff.role === "Teacher" && !staff.subject)
      return "Subject is required for teachers";

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
      branchId,
      staff: {
        ...staff,
        dateEmployed: staff.dateEmployed?.toISOString(),
        status: "active",
        createdAt: new Date().toISOString(),
      },
    };

    console.log("CREATE STAFF PAYLOAD:", payload);

    setShowInviteModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Create Staff</Text>
      </View>

      {/* FORM */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input label="Full Name *" value={staff.name} onChange={(v: string) => setStaff({ ...staff, name: v })} />
        <Input label="Email *" value={staff.email} keyboard="email-address" onChange={(v: string) => setStaff({ ...staff, email: v })} />

        <Row>
          <Input half label="Phone *" value={staff.phone} keyboard="phone-pad" onChange={(v: string) => setStaff({ ...staff, phone: v })} />
          <Input half label="Staff ID" value={staff.staffId} onChange={(v: string) => setStaff({ ...staff, staffId: v })} />
        </Row>

        <Row>
          <Select half label="Gender" value={staff.gender} onPress={() => setPicker("gender")} />
          <Select half label="Employment Type" value={staff.employmentType} onPress={() => setPicker("employment")} />
        </Row>

        <Row>
          <Input half label="Department" value={staff.department} onChange={(v: string) => setStaff({ ...staff, department: v })} />
          <Input half label="Branch" value={staff.branch} onChange={(v: string) => setStaff({ ...staff, branch: v })} />
        </Row>

        {/* ROLE */}
        <Select label="Role *" value={staff.role} onPress={() => setPicker("role")} />

        {/* SUBJECT (ONLY FOR TEACHERS) */}
        {staff.role === "Teacher" && (
          <Input
            label="Subject *"
            value={staff.subject}
            onChange={(v: string) => setStaff({ ...staff, subject: v })}
          />
        )}

        {/* DATE */}
        <Text style={styles.label}>Date of Employment</Text>
        <Pressable style={styles.select} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.selectText, staff.dateEmployed && styles.activeText]}>
            {staff.dateEmployed
              ? staff.dateEmployed.toDateString()
              : "Select date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#64748B" />
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Staff</Text>
        </Pressable>
      </View>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={staff.dateEmployed || new Date()}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setStaff({ ...staff, dateEmployed: date });
          }}
        />
      )}

      {/* PICKER SHEET */}
      {picker && (
        <PickerSheet
          title={`Select ${picker}`}
          options={
            picker === "role"
              ? STAFF_ROLES
              : picker === "gender"
              ? GENDERS
              : EMPLOYMENT_TYPES
          }
          value={
            picker === "role"
              ? staff.role
              : picker === "gender"
              ? staff.gender
              : staff.employmentType
          }
          onSelect={(value: string) => {
            setStaff({
              ...staff,
              ...(picker === "role" && { role: value, subject: "" }),
              ...(picker === "gender" && { gender: value }),
              ...(picker === "employment" && { employmentType: value }),
            });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}

      <SingleInviteModal
        visible={showInviteModal}
        email={staff.email}
        onClose={() => {
          setShowInviteModal(false);
          router.back(); // optional: go back after closing
        }}
      />
    </View>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

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
          {value === opt && (
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          )}
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