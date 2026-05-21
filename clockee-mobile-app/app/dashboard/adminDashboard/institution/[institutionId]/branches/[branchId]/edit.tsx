import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const CATEGORIES = ["Branch", "Head Office", "Warehouse"];
const RANGES = ["10m", "25m", "50m", "100m"];

export default function BranchSetup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    address: "",
    category: "Branch",
    range: "25m",
  });

  const [showCategory, setShowCategory] = useState(false);
  const [showRange, setShowRange] = useState(false);

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Branch Set up</Text>
      </View>

      {/* ================= FORM ================= */}
      <View style={styles.form}>
        {/* NAME */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="East Branch"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
        />

        {/* ADDRESS */}
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="12 Adebayo Street, Ikeja"
          value={form.address}
          onChangeText={(v) => setForm({ ...form, address: v })}
        />

        {/* CATEGORY */}
        <Text style={styles.label}>Category</Text>
        <Pressable
          style={styles.select}
          onPress={() => setShowCategory(!showCategory)}
        >
          <Text style={styles.selectText}>{form.category}</Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </Pressable>

        {showCategory &&
          CATEGORIES.map((c) => (
            <Pressable
              key={c}
              style={styles.option}
              onPress={() => {
                setForm({ ...form, category: c });
                setShowCategory(false);
              }}
            >
              <Text style={styles.optionText}>{c}</Text>
            </Pressable>
          ))}

        {/* MAP PREVIEW */}
        <View style={styles.mapCard}>
          <Image
            source={{
              uri: "https://maps.googleapis.com/maps/api/staticmap?center=Ikeja,Lagos&zoom=15&size=600x300&markers=color:red",
            }}
            style={styles.map}
          />

          <View style={styles.pin}>
            <Ionicons name="location" size={22} color="#DC2626" />
          </View>

          <View style={styles.coords}>
            <Ionicons name="location-outline" size={14} color="#0284C7" />
            <Text style={styles.coordText}>
              34°03'08.0"N 118°14'37.3"W
            </Text>
          </View>
        </View>

        {/* CLOCK IN RANGE */}
        <Text style={styles.label}>Clock-in range</Text>
        <Pressable
          style={styles.select}
          onPress={() => setShowRange(!showRange)}
        >
          <Text style={styles.selectText}>{form.range}</Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </Pressable>

        {showRange &&
          RANGES.map((r) => (
            <Pressable
              key={r}
              style={styles.option}
              onPress={() => {
                setForm({ ...form, range: r });
                setShowRange(false);
              }}
            >
              <Text style={styles.optionText}>{r}</Text>
            </Pressable>
          ))}
      </View>

      {/* ================= SUBMIT ================= */}
      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("BRANCH PAYLOAD:", form);
          router.back();
        }}
      >
        <Text style={styles.buttonText}>Done</Text>
      </Pressable>
    </View>
  );
}

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  form: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#0F172A",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#0284C7",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F5F9FF",
    marginBottom: 14,
  },

  select: {
    height: 48,
    borderWidth: 1,
    borderColor: "#0284C7",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F5F9FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  selectText: {
    fontSize: 14,
    color: "#0F172A",
  },

  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },

  optionText: {
    fontSize: 14,
  },

  mapCard: {
    borderRadius: 14,
    overflow: "hidden",
    marginVertical: 14,
    backgroundColor: "#F1F5F9",
  },

  map: {
    height: 160,
    width: "100%",
  },

  pin: {
    position: "absolute",
    top: "45%",
    left: "48%",
  },

  coords: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },

  coordText: {
    fontSize: 12,
    color: "#0F172A",
  },

  button: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0284C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});