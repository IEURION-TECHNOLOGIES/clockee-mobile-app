// ======================= IMPORTS =======================
import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

import {
  getInstitutionSettings,
  updateInstitutionSettings,
} from "../../../../../../services/institutionService";

import ResponseModal from "../../../../../../components/ResponseModal";

// ======================= TYPES =======================

interface OfficeLocation {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

interface Settings {
  hasDepartments: boolean;
  allowRemoteClocking: boolean;
  allowOfflineClocking: boolean;
  useBranches: boolean;
  enforceGeofence: boolean;
  enforceStaffId: boolean;
  enableLateAlerts: boolean;
  enableOutOfZoneAlerts: boolean;
}

// ======================= MAIN COMPONENT =======================

export default function InstitutionPreferences() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<any>();

  // ======================= STATE =======================
  const [loading, setLoading] = useState(true);        // Initial page load
  const [saving, setSaving] = useState(false);         // When saving changes
  const [hasFetched, setHasFetched] = useState(false);

  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState("");
  const [gpsRadiusMeters, setGpsRadiusMeters] = useState("");

  const [workStartTime, setWorkStartTime] = useState("");
  const [workEndTime, setWorkEndTime] = useState("");
  const [expectedWorkHours, setExpectedWorkHours] = useState("");
  const [earlyMinutes, setEarlyMinutes] = useState("");
  const [lateMinutes, setLateMinutes] = useState("");
  const [qrRefreshSeconds, setQrRefreshSeconds] = useState("");
  const [timezone, setTimezone] = useState("");

  const [officeLocation, setOfficeLocation] = useState<OfficeLocation | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [use12HourFormat, setUse12HourFormat] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  const [settings, setSettings] = useState<Settings>({
    hasDepartments: false,
    allowRemoteClocking: false,
    allowOfflineClocking: false,
    useBranches: false,
    enforceGeofence: false,
    enforceStaffId: false,
    enableLateAlerts: false,
    enableOutOfZoneAlerts: false,
  });

  // ======================= EFFECTS =======================
  useFocusEffect(
    useCallback(() => {
      if (!institutionId) return;
      const loadPickedLocation = async () => {
        try {
          const storageKey = `TEMP_OFFICE_LOCATION_${institutionId}`;
          const stored = await AsyncStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            setOfficeLocation({
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              address: parsed.address || "",
            });
            await AsyncStorage.removeItem(storageKey);
          }
        } catch (error) {
          console.log("Load location error:", error);
        }
      };
      loadPickedLocation();
    }, [institutionId])
  );

  useEffect(() => {
    if (!workStartTime || !workEndTime) return;
    const [sh, sm] = workStartTime.split(":").map(Number);
    const [eh, em] = workEndTime.split(":").map(Number);
    const diff = (eh || 0) * 60 + (em || 0) - ((sh || 0) * 60 + (sm || 0));
    if (diff > 0) setExpectedWorkHours((diff / 60).toFixed(1));
  }, [workStartTime, workEndTime]);

  useEffect(() => {
    if (!institutionId || hasFetched) return;
    fetchSettings();
  }, [institutionId]);

  // ======================= API =======================
  const fetchSettings = async () => {
  try {
    console.log("🚀 FETCHING SETTINGS...");
    console.log("🏢 Institution ID:", institutionId);

    setLoading(true);

    const res = await getInstitutionSettings(institutionId);

    console.log("📥 RAW SETTINGS RESPONSE:", res?.data);

    const data = res?.data?.data;

    if (!data) {
      console.log("❌ No settings data returned");
      return;
    }

    console.log("✅ Parsed Settings Data:", data);

    setWorkingDays(data.workingDays || []);
    setGracePeriodMinutes(String(data.gracePeriodMinutes || ""));
    setGpsRadiusMeters(String(data.gpsRadiusMeters || ""));
    setWorkStartTime(data.workStartTime || "");
    setWorkEndTime(data.workEndTime || "");
    setExpectedWorkHours(String(data.expectedWorkHours || ""));
    setEarlyMinutes(String(data.earlyMinutes || ""));
    setLateMinutes(String(data.lateMinutes || ""));
    setQrRefreshSeconds(String(data.qrRefreshSeconds || ""));
    setTimezone(data.timezone || "");

    if (data.officeLocation?.coordinates) {
      console.log("📍 Office Location from backend:", data.officeLocation);

      setOfficeLocation({
        latitude: data.officeLocation.coordinates[1],
        longitude: data.officeLocation.coordinates[0],
        address: data.officeLocation.address || "",
      });
    }

    const parsedSettings = {
      hasDepartments: data.hasDepartments ?? false,
      allowRemoteClocking: data.allowRemoteClocking ?? false,
      allowOfflineClocking: data.allowOfflineClocking ?? false,
      useBranches: data.useBranches ?? false,
      enforceGeofence: data.enforceGeofence ?? false,
      enforceStaffId: data.enforceStaffId ?? false,
      enableLateAlerts: data.notifications?.enableLateAlerts ?? false,
      enableOutOfZoneAlerts: data.notifications?.enableOutOfZoneAlerts ?? false,
    };

    console.log("⚙️ FINAL SETTINGS STATE:", parsedSettings);

    setSettings(parsedSettings);
  } catch (error: any) {
    console.log("❌ FETCH SETTINGS ERROR:", error?.response?.data || error);
    Alert.alert("Error", "Failed to load settings");
  } finally {
    setLoading(false);
    setHasFetched(true);
  }
};


  const saveChanges = async () => {
  try {
    console.log("💾 SAVING SETTINGS...");
    console.log("🏢 Institution ID:", institutionId);
    console.log("⚙️ Current Settings State:", settings);

    setSaving(true);

    const body = {
      workingDays,
      gracePeriodMinutes: Number(gracePeriodMinutes) || 0,
      gpsRadiusMeters: Number(gpsRadiusMeters) || 0,
      workStartTime,
      workEndTime,
      expectedWorkHours: Number(expectedWorkHours) || 0,
      earlyMinutes: Number(earlyMinutes) || 0,
      lateMinutes: Number(lateMinutes) || 0,
      qrRefreshSeconds: Number(qrRefreshSeconds) || 0,
      timezone,

      // 🔥 CRITICAL FLAG
      useBranches: settings.useBranches,

      hasDepartments: settings.hasDepartments,
      allowRemoteClocking: settings.allowRemoteClocking,
      allowOfflineClocking: settings.allowOfflineClocking,
      enforceGeofence: settings.enforceGeofence,
      enforceStaffId: settings.enforceStaffId,

      notifications: {
        enableLateAlerts: settings.enableLateAlerts,
        enableOutOfZoneAlerts: settings.enableOutOfZoneAlerts,
      },

      officeLocation: officeLocation
        ? {
            type: "Point",
            coordinates: [
              officeLocation.longitude,
              officeLocation.latitude,
            ],
          }
        : undefined,
    };

    console.log("📤 BODY BEING SENT TO BACKEND:");
    console.log(JSON.stringify(body, null, 2));

    const res = await updateInstitutionSettings(institutionId, body);

    console.log("📥 UPDATE RESPONSE:", res?.data);

    // 🔥 Immediately refetch to verify backend actually saved it
    console.log("🔄 REFETCHING SETTINGS TO VERIFY SAVE...");
    await fetchSettings();

    setModalType("success");
    setModalMessage("Settings updated successfully!");
    setModalVisible(true);
  } catch (error: any) {
    console.log("❌ SAVE ERROR FULL:", error);
    console.log("❌ SAVE ERROR RESPONSE:", error?.response?.data);

    setModalType("error");
    setModalMessage(
      error?.response?.data?.message || "Failed to update settings"
    );
    setModalVisible(true);
  } finally {
    setSaving(false);
  }
};

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ======================= RENDER =======================
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Loading institution settings...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Institution Preferences</Text>
          <View style={{ width: 24 }} />
        </View>

        <Section title="Time & Attendance">
          <Label>Working Days</Label>
          <View style={styles.daysRow}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(day)}
                style={[styles.dayChip, workingDays.includes(day) && styles.dayActive]}
              >
                <Text style={[styles.dayText, workingDays.includes(day) && styles.dayTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label>Office Location</Label>
          {officeLocation && (
            <View style={styles.locationPreviewCard}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={22} color="#0284C7" />
                <Text style={styles.locationTitle}>Office Location Set</Text>
              </View>

              {officeLocation.address ? (
                <Text style={styles.addressText}>
                  📍 {officeLocation.address}
                </Text>
              ) : null}

              <Text style={styles.coordsText}>
                Latitude: {officeLocation.latitude}
              </Text>
              <Text style={styles.coordsText}>
                Longitude: {officeLocation.longitude}
              </Text>

              <Text style={styles.radiusText}>
                Allowed Radius: {Number(gpsRadiusMeters) || 100} meters
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.locationBtn} onPress={() =>
            router.navigate({ pathname: "/dashboard/superAdminDashboard/institution/[institutionId]/settings/locationPicker", params: { institutionId, radius: gpsRadiusMeters } })
          }>
            <Text style={styles.locationBtnText}>
              {officeLocation ? "Change Office Location" : "Set Office Location"}
            </Text>
          </TouchableOpacity>

          {/* Grace Period with description */}
          <NumberInput
            label="Grace Period (Minutes)"
            value={gracePeriodMinutes}
            onChangeText={setGracePeriodMinutes}
            placeholder="5"
          />
          <Text style={styles.description}>
            Small buffer time. Employees can clock in this many minutes late without being marked late.
          </Text>

          <NumberInput
            label="GPS Radius (Meters)"
            value={gpsRadiusMeters}
            onChangeText={setGpsRadiusMeters}
            placeholder="100"
          />
          <Text style={styles.description}>
            Maximum distance from office where clock-in is allowed when geofence is enabled.
          </Text>

          {/* AM/PM Toggle */}
          <View style={styles.amPmToggleContainer}>
            <Text style={styles.amPmLabel}>Display Time in 12-Hour Format (AM/PM)</Text>
            <Switch value={use12HourFormat} onValueChange={setUse12HourFormat} trackColor={{ false: "#E2E8F0", true: "#0284C7" }} />
          </View>

          <TimeInput label="Work Start Time" displayValue={formatDisplayTime(workStartTime)} onPress={() => setShowStartPicker(true)} />
          {showStartPicker && (
            <DateTimePicker value={parseTimeToDate(workStartTime)} mode="time" is24Hour display="default"
              onChange={(e, date) => { setShowStartPicker(false); if (date) setWorkStartTime(formatTime(date)); }} />
          )}

          <TimeInput label="Work End Time" displayValue={formatDisplayTime(workEndTime)} onPress={() => setShowEndPicker(true)} />
          {showEndPicker && (
            <DateTimePicker value={parseTimeToDate(workEndTime)} mode="time" is24Hour display="default"
              onChange={(e, date) => { setShowEndPicker(false); if (date) setWorkEndTime(formatTime(date)); }} />
          )}

          <NumberInput label="Expected Work Hours" value={expectedWorkHours} onChangeText={setExpectedWorkHours} placeholder="8.0" editable={false} />

          <NumberInput label="Allowed Early Minutes" value={earlyMinutes} onChangeText={setEarlyMinutes} placeholder="15" />
          <Text style={styles.description}>
            How many minutes before start time employees are allowed to clock in.
          </Text>

          <NumberInput label="Allowed Late Minutes" value={lateMinutes} onChangeText={setLateMinutes} placeholder="10" />
          <Text style={styles.description}>
            How many minutes after start time (beyond grace period) is still considered acceptable.
          </Text>
          
          <NumberInput label="QR Code Refresh (Seconds)" value={qrRefreshSeconds} onChangeText={setQrRefreshSeconds} placeholder="30" />
          <Text style={styles.description}>
            How often the QR code refreshes for clock-in (higher = more secure).
          </Text>

          <Label>Timezone</Label>
          <TextInput style={styles.input} placeholder="Africa/Lagos" value={timezone} onChangeText={setTimezone} />
        </Section>

        <Section title="Advanced">
          <Toggle label="Enable Departments" value={settings.hasDepartments} onToggle={() => toggle("hasDepartments")} />
          <Toggle label="Require Staff ID" value={settings.enforceStaffId} onToggle={() => toggle("enforceStaffId")} />
        </Section>

        <Section title="Work Rules">
          <Toggle label="Allow Offline Clocking" value={settings.allowOfflineClocking} onToggle={() => toggle("allowOfflineClocking")} />
          <Toggle label="Allow Remote Clock-In" value={settings.allowRemoteClocking} onToggle={() => toggle("allowRemoteClocking")} />
          <Toggle label="Enable Branches" value={settings.useBranches} onToggle={() => toggle("useBranches")} />
          <Toggle label="Enforce Geofence" value={settings.enforceGeofence} onToggle={() => toggle("enforceGeofence")} />
          <Toggle label="Enable Late Alerts" value={settings.enableLateAlerts} onToggle={() => toggle("enableLateAlerts")} />
          <Toggle label="Enable Out of Zone Alerts" value={settings.enableOutOfZoneAlerts} onToggle={() => toggle("enableOutOfZoneAlerts")} />
        </Section>

        <TouchableOpacity style={styles.saveBtn} onPress={saveChanges} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <ResponseModal visible={modalVisible} type={modalType} title={modalType === "success" ? "Success" : "Error"} message={modalMessage} onClose={() => setModalVisible(false)} />
    </>
  );
}

// ======================= COMPONENTS =======================
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#E2E8F0", true: "#0284C7" }} />
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function NumberInput({ label, value, onChangeText, placeholder = "0", editable = true }: {
  label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; editable?: boolean;
}) {
  return (
    <>
      <Label>{label}</Label>
      <TextInput
        style={[styles.input, !editable && styles.readOnlyInput]}
        keyboardType="number-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
      />
    </>
  );
}

function TimeInput({ label, displayValue, onPress }: {
  label: string; displayValue: string; onPress: () => void;
}) {
  return (
    <>
      <Label>{label}</Label>
      <TouchableOpacity style={styles.timeInputContainer} onPress={onPress} activeOpacity={0.75}>
        <View style={styles.timeInputContent}>
          <View style={styles.timeIconContainer}>
            <Ionicons name="time" size={26} color="#0284C7" />
          </View>
          <View style={styles.timeTextContainer}>
            <Text style={styles.timeValue}>{displayValue}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={22} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    </>
  );
}

// ======================= STYLES =======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16, marginTop: 44 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748B" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },

  section: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16, color: "#0F172A" },

  label: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 6, color: "#334155" },

  input: { backgroundColor: "#F1F5F9", padding: 14, borderRadius: 10, fontSize: 15, marginBottom: 4 },
  readOnlyInput: { backgroundColor: "#F8FAFC", color: "#64748B" },

  description: { fontSize: 12.5, color: "#64748B", marginBottom: 12, lineHeight: 18 },

  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#E2E8F0" },
  dayActive: { backgroundColor: "#0284C7" },
  dayText: { fontSize: 13, color: "#475569" },
  dayTextActive: { color: "#fff", fontWeight: "700" },

  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  toggleLabel: { fontSize: 15, fontWeight: "600", color: "#1E2937" },

  amPmToggleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", padding: 14, borderRadius: 12, marginVertical: 12 },
  amPmLabel: { fontSize: 15, fontWeight: "600", color: "#1E2937", flex: 1 },

  mapPreview: { height: 180, borderRadius: 15, marginVertical: 10 },
  locationBtn: { marginTop: 8, padding: 14, backgroundColor: "#E2E8F0", borderRadius: 12, alignItems: "center" },
  locationBtnText: { fontWeight: "600", color: "#1E2937" },
  addressText: { marginTop: 8, fontSize: 13, color: "#64748B" },

  saveBtn: { backgroundColor: "#0284C7", padding: 16, borderRadius: 20, alignItems: "center", marginVertical: 20 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  timeInputContainer: {
    backgroundColor: "#FFFFFF", borderRadius: 16, marginBottom: 18, borderWidth: 1.5,
    borderColor: "#E2E8F0", shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  timeInputContent: { flexDirection: "row", alignItems: "center", paddingVertical: 18, paddingHorizontal: 16, gap: 16 },
  timeIconContainer: { width: 52, height: 52, borderRadius: 14, backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center" },
  timeTextContainer: { flex: 1 },
  timeValue: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  locationPreviewCard: {
  backgroundColor: "#F0F9FF",
  padding: 16,
  borderRadius: 14,
  marginVertical: 10,
  borderWidth: 1,
  borderColor: "#BAE6FD",
},

locationRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
},

locationTitle: {
  fontWeight: "700",
  color: "#0F172A",
},

coordsText: {
  fontSize: 13,
  color: "#475569",
  marginTop: 2,
},

radiusText: {
  marginTop: 8,
  fontWeight: "600",
  color: "#0284C7",
},
});

// Helper functions (add these before the styles)
const formatTime = (date: Date): string =>
  date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

const parseTimeToDate = (timeString: string): Date => {
  const date = new Date();
  if (!timeString) return date;
  const [hours, minutes] = timeString.split(":").map(Number);
  date.setHours(hours || 0);
  date.setMinutes(minutes || 0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const formatDisplayTime = (time24: string, use12Hour: boolean): string => {
  if (!time24) return "Tap to select time";
  if (!use12Hour) return time24;
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
};




