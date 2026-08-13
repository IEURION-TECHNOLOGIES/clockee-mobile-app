import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Platform,
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

export default function EditAdmin() {
  const router = useRouter();
  const { adminId, institutionId } = useLocalSearchParams<{
    adminId: string;
    institutionId: string;
  }>();

  /* ===== PREFILLED (API later) ===== */
  const [admin, setAdmin] = useState({
    name: "John Doe",
    email: "john@greenwood.com",
    phone: "+2348123456789",
    role: "Primary Admin",
    gender: "Male",
    staffId: "GRW-ADM-021",
    department: "Operations",
    branch: "Ikeja Branch",
    employmentType: "Full Time",
    dateEmployed: new Date("2022-02-12"),
  });

  const [picker, setPicker] = useState<
    "role" | "gender" | "employment" | null
  >(null);

  const [showDate, setShowDate] = useState(false);
  const [error, setError] = useState("");

  /* ================= SUBMIT ================= */
  const handleSave = () => {
    if (
      !admin.name ||
      !admin.email ||
      !admin.phone ||
      !admin.department ||
      !admin.branch
    ) {
      setError("All required fields must be filled");
      return;
    }

    if (!admin.email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    setError("");

    const payload = {
      adminId,
      institutionId,
      ...admin,
      updatedAt: new Date().toISOString(),
    };

    console.log("UPDATE ADMIN:", payload);

    // await updateAdmin(payload)
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Edit Admin</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Input label="Full Name" value={admin.name} onChange={(v) => setAdmin({ ...admin, name: v })} />
          <Input label="Email" value={admin.email} keyboard="email-address" onChange={(v) => setAdmin({ ...admin, email: v })} />
          <Input label="Phone" value={admin.phone} keyboard="phone-pad" onChange={(v) => setAdmin({ ...admin, phone: v })} />

          <Select label="Gender" value={admin.gender} onPress={() => setPicker("gender")} />
          <Select label="Role" value={admin.role} onPress={() => setPicker("role")} />
          <Select label="Employment Type" value={admin.employmentType} onPress={() => setPicker("employment")} />

          <Input label="Staff ID" value={admin.staffId} onChange={(v) => setAdmin({ ...admin, staffId: v })} />
          <Input label="Department" value={admin.department} onChange={(v) => setAdmin({ ...admin, department: v })} />
          <Input label="Branch" value={admin.branch} onChange={(v) => setAdmin({ ...admin, branch: v })} />

          {/* DATE PICKER */}
          <Text style={styles.label}>Date Employed</Text>
          <Pressable style={styles.select} onPress={() => setShowDate(true)}>
            <Text style={styles.selectText}>
              {admin.dateEmployed.toDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#64748B" />
          </Pressable>

          {showDate && (
            <DateTimePicker
              value={admin.dateEmployed}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowDate(false);
                if (date) setAdmin({ ...admin, dateEmployed: date });
              }}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>

      {/* SAVE */}
      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </Pressable>

      {/* PICKER SHEETS */}
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

/* ================= REUSABLE ================= */

const Input = ({ label, value, onChange, keyboard = "default" }: any) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      keyboardType={keyboard}
      onChangeText={onChange}
    />
  </>
);

const Select = ({ label, value, onPress }: any) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Pressable style={styles.select} onPress={onPress}>
      <Text style={styles.selectText}>{value}</Text>
      <Ionicons name="chevron-down" size={18} color="#64748B" />
    </Pressable>
  </>
);

const PickerSheet = ({ title, options, value, onSelect, onClose }: any) => (
  <View style={styles.overlay}>
    <View style={styles.sheet}>
      <Text style={styles.sheetTitle}>{title}</Text>
      {options.map((opt: string) => (
        <Pressable key={opt} style={styles.item} onPress={() => onSelect(opt)}>
          <Text style={styles.itemText}>{opt}</Text>
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
  container: { flex: 1, backgroundColor: "#FFF", paddingTop: 50 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  title: { fontSize: 17, fontWeight: "800", color: "#0F172A" },

  form: { padding: 16 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, paddingHorizontal: 12, marginBottom: 14 },

  select: { height: 48, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  selectText: { fontSize: 14, fontWeight: "600", color: "#0F172A" },

  error: { color: "#DC2626", fontSize: 12, marginTop: 8 },

  button: { height: 54, backgroundColor: "#0284C7", margin: 16, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  overlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetTitle: { fontSize: 15, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  item: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 },
  itemText: { fontSize: 14, fontWeight: "600" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { fontWeight: "700", color: "#64748B" },
});