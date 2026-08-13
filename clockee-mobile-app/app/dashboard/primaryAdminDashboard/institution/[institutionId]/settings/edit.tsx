import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ================= MOCK DATA (API LATER) ================= */
const COUNTRIES = [
  { name: "Nigeria", states: ["Lagos", "Abuja", "Rivers", "Oyo"] },
  { name: "Ghana", states: ["Accra", "Kumasi"] },
];

const TIMEZONES = ["WAT (West Africa Time)", "GMT", "UTC"];

/* ================= MAIN ================= */
export default function EditInstitutionProfile() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  const [logo, setLogo] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "",
    country: "",
    state: "",
    city: "",
    phone: "",
    address: "",
    timezone: "",
    status: "active",
  });

  const [states, setStates] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ================= IMAGE PICKER ================= */
  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  /* ================= COUNTRY → STATE ================= */
  useEffect(() => {
    const selected = COUNTRIES.find(
      (c) => c.name === form.country
    );
    setStates(selected ? selected.states : []);
    setForm((p) => ({ ...p, state: "" }));
  }, [form.country]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Institution name required";
    if (!form.email) e.email = "Email required";
    if (!form.country) e.country = "Select country";
    if (!form.state) e.state = "Select state";
    if (!form.phone) e.phone = "Phone required";
    if (!form.timezone) e.timezone = "Timezone required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      institutionId,
      logo,
      ...form,
      updatedAt: new Date().toISOString(),
    };

    console.log("UPDATE INSTITUTION PAYLOAD:", payload);
    router.back();
  };

  /* ================= UI ================= */
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>
          Edit Institution Profile
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* LOGO */}
      <View style={styles.logoWrap}>
        <Image
          source={
            logo
              ? { uri: logo }
              : {
                  uri: "https://ui-avatars.com/api/?name=Institution&background=0284C7&color=fff",
                }
          }
          style={styles.logo}
        />
        <Pressable style={styles.cameraBtn} onPress={pickLogo}>
          <Ionicons name="camera" size={16} color="#fff" />
        </Pressable>
      </View>

      {/* FORM */}
      <Input
        label="Institution name"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        error={errors.name}
      />

      <Input
        label="Email"
        value={form.email}
        keyboard="email-address"
        onChange={(v) => setForm({ ...form, email: v })}
        error={errors.email}
      />

      <Input
        label="Institution Type"
        value={form.type}
        onChange={(v) => setForm({ ...form, type: v })}
      />

      <View style={styles.row}>
        <Select
          label="Country"
          value={form.country}
          options={COUNTRIES.map((c) => c.name)}
          onSelect={(v) => setForm({ ...form, country: v })}
          error={errors.country}
        />
        <Select
          label="State"
          value={form.state}
          options={states}
          onSelect={(v) => setForm({ ...form, state: v })}
          error={errors.state}
        />
      </View>

      <Input
        label="City"
        value={form.city}
        onChange={(v) => setForm({ ...form, city: v })}
      />

      <Input
        label="Phone Number"
        value={form.phone}
        keyboard="phone-pad"
        onChange={(v) => setForm({ ...form, phone: v })}
        error={errors.phone}
      />

      <Input
        label="Address"
        value={form.address}
        onChange={(v) => setForm({ ...form, address: v })}
      />

      <Select
        label="Time zone"
        value={form.timezone}
        options={TIMEZONES}
        onSelect={(v) => setForm({ ...form, timezone: v })}
        error={errors.timezone}
      />

      {/* STATUS */}
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {["active", "inactive"].map((s) => (
          <Pressable
            key={s}
            style={[
              styles.statusBtn,
              form.status === s && styles.statusActive,
            ]}
            onPress={() => setForm({ ...form, status: s })}
          >
            <Text
              style={[
                styles.statusText,
                form.status === s && styles.statusTextActive,
              ]}
            >
              {s === "active" ? "Active" : "Deactivate"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* SAVE */}
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Input({ label, value, onChange, error, keyboard }: any) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error && { borderColor: "#DC2626" },
        ]}
        value={value}
        keyboardType={keyboard}
        onChangeText={onChange}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

function Select({ label, value, options, onSelect, error }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          styles.input,
          styles.select,
          error && { borderColor: "#DC2626" },
        ]}
        onPress={() =>
          onSelect(options[0]) // placeholder (modal later)
        }
      >
        <Text>{value || "Select"}</Text>
        <Ionicons name="chevron-down" size={16} />
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 20, marginTop: 40},
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: "38%",
    backgroundColor: "#0284C7",
    padding: 6,
    borderRadius: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
  },

  select: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  row: { flexDirection: "row", gap: 12 },

  error: {
    color: "#DC2626",
    fontSize: 11,
    marginTop: 4,
  },

  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },

  statusActive: {
    backgroundColor: "#0284C7",
    borderColor: "#0284C7",
  },

  statusText: { fontSize: 13 },
  statusTextActive: { color: "#fff", fontWeight: "600" },

  saveBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 14,
    borderRadius: 26,
    marginTop: 30,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});