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

// 3 options each, as requested
const SCHOOL_DEPARTMENTS = [
  "Science",
  "Arts",
  "Commercial",
];

const COMPANY_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
];

// Simple validators
const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone: string) =>
  // Allow digits, spaces, +, -, (), minimum 7 digits overall
  /[\d]{7,}/.test(phone.replace(/\D/g, ""));

export default function CreateInstitutionStepOne() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryValue, setCategoryValue] = useState(""); // department or industry

  const [typeOpen, setTypeOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Dynamic category
  const isSchool = type === "school";
  const categoryLabel = isSchool ? "Department" : "Industry";
  const categoryOptions = isSchool ? SCHOOL_DEPARTMENTS : COMPANY_INDUSTRIES;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Institution name is required";
    }

    if (!type) {
      newErrors.type = "Institution type is required";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!categoryValue) {
      newErrors.category = `${categoryLabel} is required`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);

    // Small delay to show loading state (optional, feels nicer)
    setTimeout(() => {
      router.push({
        pathname:
          "/dashboard/superAdminDashboard/institution/institutionCreation/CreationStepTwo",
        params: {
          name: name.trim(),
          type,
          address: address.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          industry: categoryValue,
        },
      });
      setLoading(false);
    }, 250);
  };

  const renderError = (field: string) =>
    errors[field] ? (
      <Text style={styles.errorText}>{errors[field]}</Text>
    ) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="dark" />

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Create Institution</Text>
            <Text style={styles.subtitle}>Step 1 of 2</Text>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* NAME */}
          <View style={styles.field}>
            <Text style={styles.label}>Institution Name</Text>
            <TextInput
              placeholder="e.g. Greenfield High School"
              style={[
                styles.input,
                errors.name && styles.inputError,
              ]}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((e) => ({ ...e, name: "" }));
              }}
              autoCapitalize="words"
            />
            {renderError("name")}
          </View>

          {/* TYPE DROPDOWN */}
          <View style={styles.field}>
            <Text style={styles.label}>Institution Type</Text>
            <Pressable
              style={[
                styles.input,
                errors.type && styles.inputError,
              ]}
              onPress={() => {
                setTypeOpen(!typeOpen);
                if (categoryOpen) setCategoryOpen(false);
                if (errors.type) setErrors((e) => ({ ...e, type: "" }));
              }}
            >
              <Text style={styles.inputText}>
                {type || "Select Type"}
              </Text>
              <Ionicons
                name={typeOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#64748B"
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
                      setCategoryValue("");
                      if (errors.type) setErrors((e) => ({ ...e, type: "" }));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {renderError("type")}
          </View>

          {/* DYNAMIC CATEGORY: DEPARTMENT / INDUSTRY */}
          {!!type && (
            <View style={styles.field}>
              <Text style={styles.label}>{categoryLabel}</Text>
              <Pressable
                style={[
                  styles.input,
                  errors.category && styles.inputError,
                ]}
                onPress={() => {
                  setCategoryOpen(!categoryOpen);
                  if (typeOpen) setTypeOpen(false);
                  if (errors.category)
                    setErrors((e) => ({ ...e, category: "" }));
                }}
              >
                <Text style={styles.inputText}>
                  {categoryValue || `Select ${categoryLabel}`}
                </Text>
                <Ionicons
                  name={categoryOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#64748B"
                />
              </Pressable>

              {categoryOpen && (
                <View style={styles.dropdown}>
                  {categoryOptions.map((item) => (
                    <Pressable
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategoryValue(item);
                        setCategoryOpen(false);
                        if (errors.category)
                          setErrors((e) => ({ ...e, category: "" }));
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {renderError("category")}
            </View>
          )}

          {/* ADDRESS */}
          <View style={styles.field}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              placeholder="e.g. 123 Main St, Lagos"
              style={[
                styles.input,
                errors.address && styles.inputError,
              ]}
              value={address}
              onChangeText={(v) => {
                setAddress(v);
                if (errors.address) setErrors((e) => ({ ...e, address: "" }));
              }}
              autoCapitalize="words"
            />
            {renderError("address")}
          </View>

          {/* EMAIL */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="contact@institution.com"
              style={[
                styles.input,
                errors.email && styles.inputError,
              ]}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: "" }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {renderError("email")}
          </View>

          {/* PHONE */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              placeholder="e.g. +234 801 234 5678"
              style={[
                styles.input,
                errors.phone && styles.inputError,
              ]}
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
              }}
              keyboardType="phone-pad"
            />
            {renderError("phone")}
          </View>
        </View>

        {/* NEXT BUTTON */}
        <Pressable
          style={[
            styles.button,
            (!validateFormSafe(name, type, address, email, phone, categoryValue) ||
              loading) &&
              styles.buttonDisabled,
          ]}
          disabled={
            !validateFormSafe(
              name,
              type,
              address,
              email,
              phone,
              categoryValue
            ) || loading
          }
          onPress={handleNext}
        >
          {loading ? (
            <Ionicons name="hourglass-outline" size={22} color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Next</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            </>
          )}
        </Pressable>

        {/* Extra bottom padding for scroll comfort */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper for button disabled state (no side effects)
function validateFormSafe(
  name: string,
  type: string,
  address: string,
  email: string,
  phone: string,
  categoryValue: string
) {
  if (!name.trim()) return false;
  if (!type) return false;
  if (!address.trim()) return false;
  if (!email.trim()) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return false;
  if (!phone.trim()) return false;
  if (!/[\d]{7,}/.test(phone.trim().replace(/\D/g, ""))) return false;
  if (!categoryValue) return false;
  return true;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  form: {
    gap: 18,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 2,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputText: {
    color: "#0F172A",
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 2,
    marginTop: 4,
  },

  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#0F172A",
  },

  button: {
    marginTop: 22,
    height: 54,
    backgroundColor: "#0EA5E9",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
