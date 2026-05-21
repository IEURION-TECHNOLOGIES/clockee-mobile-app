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

const INSTITUTION_TYPES = [
  "School",
  "University",
  "Company",
  "Training Center",
  "Other",
];

export default function CreateInstitutionStepOne() {
  const router = useRouter();

  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const handleNext = () => {
    if (!institutionName || !institutionType || !country || !state || !city) {
      alert("Please complete all fields");
      return;
    }

    router.push("/institution/create/stepTwo"); // next step
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="dark" />

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#0F172A" />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Create New Institution</Text>
            <Text style={styles.subtitle}>
              Set up a new institution in just a few steps
            </Text>
          </View>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[styles.progressDot, i === 0 && styles.activeDot]}
            />
          ))}
        </View>

        <Text style={styles.stepTitle}>Institution</Text>
        <Text style={styles.stepSubtitle}>Basic details</Text>

        {/* FORM */}
        <View style={styles.form}>
          {/* NAME */}
          <Text style={styles.label}>Institution Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Institution Name"
            value={institutionName}
            onChangeText={setInstitutionName}
          />

          {/* TYPE */}
          <Text style={styles.label}>Institution Type</Text>
          <Pressable
            style={styles.input}
            onPress={() => setTypeOpen(!typeOpen)}
          >
            <Text
              style={{
                color: institutionType ? "#0F172A" : "#94A3B8",
              }}
            >
              {institutionType || "Select Institution Type"}
            </Text>
            <Ionicons
              name={typeOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
              style={{ position: "absolute", right: 14 }}
            />
          </Pressable>

          {typeOpen && (
            <View style={styles.dropdown}>
              {INSTITUTION_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setInstitutionType(type);
                    setTypeOpen(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{type}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* LOCATION */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Select Country"
                value={country}
                onChangeText={setCountry}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter State"
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter City"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* NEXT */}
        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  progressContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },

  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
    marginRight: 10,
  },

  activeDot: {
    backgroundColor: "#0EA5E9",
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  stepSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
  },

  form: {
    marginBottom: 40,
  },

  label: {
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 6,
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

  button: {
    backgroundColor: "#8ED1F5",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
