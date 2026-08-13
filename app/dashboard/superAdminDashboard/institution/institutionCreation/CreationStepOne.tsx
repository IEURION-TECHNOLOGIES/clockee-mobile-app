import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const TYPES = ["school", "company"];

const INDUSTRIES = [
  "Technology",
  "Education",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
];

export default function CreateInstitutionStepOne() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);

  const isValid =
    name && type && address && email && phone && industry;

  const handleNext = () => {
    if (!isValid) return;

    router.push({
      pathname:
        "/dashboard/superAdminDashboard/institution/institutionCreation/CreationStepTwo",
      params: {
        name,
        type,
        address,
        email,
        phone,
        industry,
      },
    });
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
          <Text style={styles.title}>Create Institution</Text>
        </View>

        <View style={styles.form}>
          {/* NAME */}
          <TextInput
            placeholder="Institution Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          {/* TYPE DROPDOWN */}
          <Pressable
            style={styles.input}
            onPress={() => setTypeOpen(!typeOpen)}
          >
            <Text style={{ color: type ? "#000" : "#94A3B8" }}>
              {type || "Select Type"}
            </Text>
            <Ionicons
              name={typeOpen ? "chevron-up" : "chevron-down"}
              size={18}
            />
          </Pressable>

          {typeOpen && (
            <View style={styles.dropdown}>
              {TYPES.map((item) => (
                <Pressable
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setType(item);
                    setTypeOpen(false);
                  }}
                >
                  <Text>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* INDUSTRY DROPDOWN */}
          <Pressable
            style={styles.input}
            onPress={() => setIndustryOpen(!industryOpen)}
          >
            <Text style={{ color: industry ? "#000" : "#94A3B8" }}>
              {industry || "Select Industry"}
            </Text>
            <Ionicons
              name={industryOpen ? "chevron-up" : "chevron-down"}
              size={18}
            />
          </Pressable>

          {industryOpen && (
            <View style={styles.dropdown}>
              {INDUSTRIES.map((item) => (
                <Pressable
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setIndustry(item);
                    setIndustryOpen(false);
                  }}
                >
                  <Text>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* OTHER INPUTS */}
          <TextInput
            placeholder="Address"
            style={styles.input}
            value={address}
            onChangeText={setAddress}
          />

          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Phone"
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* NEXT */}
        <Pressable
          style={[styles.button, !isValid && styles.disabled]}
          disabled={!isValid}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: "700" },

  form: { gap: 14 },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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