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

/* ================= OPTIONS ================= */

const STAFF_ROLES = ["Teacher", "Administration", "Support"] as const;
const GENDERS = ["Male", "Female"] as const;
const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"] as const;

/* ================= MAIN ================= */

export default function EditStaff() {
  const router = useRouter();
  const { staffId, institutionId, branchId } =
    useLocalSearchParams<{
      staffId: string;
      institutionId: string;
      branchId: string;
    }>();

  /* ===== PREFILLED DATA (API later) ===== */

  const [staff, setStaff] = useState({
    name: "Sarah James",
    email: "sarah@greenwood.com",
    phone: "+2348123456789",
    role: "Teacher",
    gender: "Female",
    staffId: "GRW-STF-101",
    department: "Academics",
    branch: "Ikeja Branch",
    employmentType: "Full Time",
    subject: "Mathematics",
    dateEmployed: new Date("2022-02-12"),
  });

  const [picker, setPicker] = useState<
    "role" | "gender" | "employment" | null
  >(null);

  const [showDate, setShowDate] = useState(false);
  const [error, setError] = useState("");

  /* ================= SAVE ================= */

  const handleSave = () => {
    if (!staff.name || !staff.email || !staff.phone) {
      setError("All required fields must be filled");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(staff.email)) {
      setError("Enter a valid email address");
      return;
    }

    if (staff.role === "Teacher" && !staff.subject) {
      setError("Subject is required for teachers");
      return;
    }

    setError("");

    const payload = {
      staffId,
      institutionId,
      branchId,
      ...staff,
      updatedAt: new Date().toISOString(),
    };

    console.log("UPDATE STAFF:", payload);

    // await updateStaff(payload)
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
        <Text style={styles.title}>Edit Staff</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={staff.name}
            onChange={(v: string) => setStaff({ ...staff, name: v })}
          />

          <Input
            label="Email"
            value={staff.email}
            keyboard="email-address"
            onChange={(v: string) => setStaff({ ...staff, email: v })}
          />

          <Input
            label="Phone"
            value={staff.phone}
            keyboard="phone-pad"
            onChange={(v: string) => setStaff({ ...staff, phone: v })}
          />

          <Select
            label="Gender"
            value={staff.gender}
            onPress={() => setPicker("gender")}
          />

          <Select
            label="Role"
            value={staff.role}
            onPress={() => setPicker("role")}
          />

          {/* SUBJECT IF TEACHER */}
          {staff.role === "Teacher" && (
            <Input
              label="Subject"
              value={staff.subject}
              onChange={(v: string) => setStaff({ ...staff, subject: v })}
            />
          )}

          <Select
            label="Employment Type"
            value={staff.employmentType}
            onPress={() => setPicker("employment")}
          />

          <Input
            label="Staff ID"
            value={staff.staffId}
            onChange={(v: string) => setStaff({ ...staff, staffId: v })}
          />

          <Input
            label="Department"
            value={staff.department}
            onChange={(v: string) => setStaff({ ...staff, department: v })}
          />

          <Input
            label="Branch"
            value={staff.branch}
            onChange={(v: string) => setStaff({ ...staff, branch: v })}
          />

          {/* DATE */}
          <Text style={styles.label}>Date Employed</Text>
          <Pressable style={styles.select} onPress={() => setShowDate(true)}>
            <Text style={styles.selectText}>
              {staff.dateEmployed.toDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#64748B" />
          </Pressable>

          {showDate && (
            <DateTimePicker
              value={staff.dateEmployed}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowDate(false);
                if (date) setStaff({ ...staff, dateEmployed: date });
              }}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>

      {/* SAVE BUTTON */}
      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </Pressable>

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
              ...(picker === "employment" && {
                employmentType: value,
              }),
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: { fontSize: 17, fontWeight: "800", color: "#0F172A" },

  form: { padding: 16 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  select: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  selectText: { fontSize: 14, fontWeight: "600", color: "#0F172A" },

  error: { color: "#DC2626", fontSize: 12, marginTop: 8 },

  button: {
    height: 54,
    backgroundColor: "#0284C7",
    margin: 16,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  itemText: { fontSize: 14, fontWeight: "600" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { fontWeight: "700", color: "#64748B" },
});