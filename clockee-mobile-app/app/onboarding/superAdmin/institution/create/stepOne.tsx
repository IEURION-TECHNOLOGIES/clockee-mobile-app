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

import { useInstitutionForm } from "@/context/InstitutionFormContext";
import { countries, getCities, getStates } from "@/utils/Location";

const INSTITUTION_TYPES = [
  "university",
  "company",
];

export default function CreateInstitutionStepOne() {
  const router = useRouter();
  const { form, updateForm } = useInstitutionForm();

  const { basic, location } = form;

  const { institutionName, institutionType } = basic;
  const { country, state, city } = location;

  const [typeOpen, setTypeOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const states = country ? getStates(country.isoCode) : [];
  const cities =
    country && state ? getCities(country.isoCode, state.isoCode) : [];


  const anyDropdownOpen =
  typeOpen || countryOpen || stateOpen || cityOpen;


  // ✅ FORM VALIDATION STATE
  const isFormComplete =
    institutionName &&
    institutionType &&
    country &&
    state &&
    city;

  const handleNext = () => {
    if (!isFormComplete) return;

    router.push(
      "/onboarding/superAdmin/institution/create/stepTwo"
    );
  };

  const closeAllDropdowns = () => {
  setTypeOpen(false);
  setCountryOpen(false);
  setStateOpen(false);
  setCityOpen(false);
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
        {anyDropdownOpen && (
        <Pressable
            style={styles.overlay}
            onPress={closeAllDropdowns}
        />
        )}

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
            onChangeText={(text) =>
              updateForm("basic", { institutionName: text })
            }
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
              style={styles.chevron}
            />
          </Pressable>

          {typeOpen && (
            <View style={styles.dropdown}>
              {INSTITUTION_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    updateForm("basic", { institutionType: type });
                    setTypeOpen(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{type}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* COUNTRY */}
          <Text style={styles.label}>Country</Text>
          <Pressable
            style={styles.input}
            onPress={() => setCountryOpen(!countryOpen)}
          >
            <Text style={{ color: country ? "#0F172A" : "#94A3B8" }}>
              {country?.name || "Select Country"}
            </Text>
            <Ionicons
              name={countryOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
              style={styles.chevron}
            />
          </Pressable>

          {countryOpen && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled>
                {countries.map((c) => (
                  <Pressable
                    key={c.isoCode}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateForm("location", {
                          country: c,
                          state: null,
                          city: null,
                      });
                      setCountryOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* STATE */}
          <Text style={styles.label}>State</Text>
          <Pressable
            style={[
              styles.input,
              !country && styles.disabledInput,
            ]}
            disabled={!country}
            onPress={() => setStateOpen(!stateOpen)}
          >
            <Text style={{ color: state ? "#0F172A" : "#94A3B8" }}>
              {state?.name || "Select State"}
            </Text>
            <Ionicons
              name={stateOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
              style={styles.chevron}
            />
          </Pressable>

          {stateOpen && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled>
                {states.map((s) => (
                  <Pressable
                    key={s.isoCode}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateForm("location",{
                          state: s,
                          city: null,
                      });
                      setStateOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{s.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* CITY */}
          <Text style={styles.label}>City</Text>
          <Pressable
            style={[
              styles.input,
              !state && styles.disabledInput,
            ]}
            disabled={!state}
            onPress={() => setCityOpen(!cityOpen)}
          >
            <Text style={{ color: city ? "#0F172A" : "#94A3B8" }}>
              {city?.name || "Select City"}
            </Text>
            <Ionicons
              name={cityOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
              style={styles.chevron}
            />
          </Pressable>

          {cityOpen && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled>
                {cities.map((c) => (
                  <Pressable
                    key={c.name}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateForm("location", {
                          city: c,
                      });
                      setCityOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ✅ NEXT BUTTON */}
        <Pressable
          style={[
            styles.button,
            !isFormComplete && styles.buttonDisabled,
          ]}
          disabled={!isFormComplete}
          onPress={handleNext}
        >
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  disabledInput: {
    backgroundColor: "#F1F5F9",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    marginTop: 6,
    maxHeight: 220,
    backgroundColor: "#FFFFFF",
    zIndex: 999,
    elevation: 10, // Android
    },

    dropdownScroll: {
    maxHeight: 220,
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
    backgroundColor: "#35a8e6ff",
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
  chevron: {
    position: "absolute",
    right: 14,
  },
  buttonDisabled: {
  backgroundColor: "#424d5aff",
  opacity: 0.6,
},
overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
},

});
