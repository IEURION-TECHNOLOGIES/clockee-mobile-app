import { useInstitutionForm } from "@/context/InstitutionFormContext";
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

/* ------------------ CONSTANTS ------------------ */

const TIME_ZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
];

const generateTimes = () => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m of ["00", "30"]) {
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      times.push(
        `${hour12.toString().padStart(2, "0")}:${m} ${ampm}`
      );
    }
  }
  return times;
};

const TIMES = generateTimes();

/* ------------------ COMPONENT ------------------ */

export default function CreateInstitutionStepThree() {
  const router = useRouter();
  const { form, updateForm } = useInstitutionForm();

  const { timeZone, startTime, endTime, gracePeriod } =
    form.timeAttendance;

    const isFormComplete = !!timeZone && !!startTime && !!endTime && !!gracePeriod;

  /* ---------- DROPDOWN STATE ---------- */
  const [tzOpen, setTzOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const closeAll = () => {
    setTzOpen(false);
    setStartOpen(false);
    setEndOpen(false);
  };

  const anyOpen = tzOpen || startOpen || endOpen;

  /* ---------- NEXT ---------- */
  const handleNext = () => {
    if (!timeZone || !startTime || !endTime || !gracePeriod) {
      alert("Please complete all fields");
      return;
    }

    router.push(
      "/onboarding/superAdmin/institution/create/stepFour"
    );
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
        {anyOpen && (
          <Pressable style={styles.overlay} onPress={closeAll} />
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
          <View style={[styles.progressDot, styles.completedDot]} />
          <View style={[styles.progressDot, styles.completedDot]} />
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* STEP INFO */}
        <Text style={styles.stepTitle}>Time & Attendance</Text>
        <Text style={styles.stepSubtitle}>Work settings</Text>

        {/* FORM */}
        <View style={styles.form}>
          {/* TIME ZONE */}
          <Text style={styles.label}>Time zone</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => {
              closeAll();
              setTzOpen(true);
            }}
          >
            <Text style={timeZone ? undefined : styles.placeholder}>
              {timeZone || "Select Time zone"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </Pressable>

          {tzOpen && (
            <View style={styles.dropdownList}>
              <ScrollView nestedScrollEnabled>
                {TIME_ZONES.map((tz) => (
                  <Pressable
                    key={tz}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateForm("timeAttendance", { timeZone: tz });
                      setTzOpen(false);
                    }}
                  >
                    <Text>{tz}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* START & END TIME */}
          <View style={styles.row}>
            {/* START */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Default work start time</Text>
              <Pressable
                style={styles.dropdown}
                onPress={() => {
                  closeAll();
                  setStartOpen(true);
                }}
              >
                <Text>{startTime || "Select time"}</Text>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </Pressable>

              {startOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled>
                    {TIMES.map((t) => (
                      <Pressable
                        key={t}
                        style={styles.dropdownItem}
                        onPress={() => {
                          updateForm("timeAttendance", {
                            startTime: t,
                          });
                          setStartOpen(false);
                        }}
                      >
                        <Text>{t}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={{ width: 12 }} />

            {/* END */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Default work end time</Text>
              <Pressable
                style={styles.dropdown}
                onPress={() => {
                  closeAll();
                  setEndOpen(true);
                }}
              >
                <Text>{endTime || "Select time"}</Text>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </Pressable>

              {endOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled>
                    {TIMES.map((t) => (
                      <Pressable
                        key={t}
                        style={styles.dropdownItem}
                        onPress={() => {
                          updateForm("timeAttendance", {
                            endTime: t,
                          });
                          setEndOpen(false);
                        }}
                      >
                        <Text>{t}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* GRACE PERIOD */}
          <Text style={styles.label}>Attendance Grace Period</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Minutes"
            keyboardType="numeric"
            value={gracePeriod}
            onChangeText={(value) =>
              updateForm("timeAttendance", { gracePeriod: value })
            }
          />

          <Text style={styles.helperText}>
            Number of minutes allowed after start time before marking
            as late
          </Text>
        </View>

        {/* NEXT */}
        <Pressable
          onPress={handleNext}
          disabled={!isFormComplete}
          style={[
            styles.button,
            !isFormComplete && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}
          >
            Next
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------ STYLES ------------------ */

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

  completedDot: {
    backgroundColor: "#22C55E",
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
    marginBottom: 50,
  },

  label: {
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 6,
    marginTop: 16,
  },

  dropdown: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  dropdownList: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    marginTop: 6,
    maxHeight: 220,
    backgroundColor: "#FFFFFF",
    zIndex: 999,
    elevation: 10,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  placeholder: {
    color: "#94A3B8",
  },

  row: {
    flexDirection: "row",
    marginTop: 6,
  },

  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },

  helperText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
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

  buttonDisabled: {
    backgroundColor: "#438fecff",
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
