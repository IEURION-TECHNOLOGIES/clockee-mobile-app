// components/students/StudentClockInForm.tsx

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useStudentClockIn } from "@/hooks/students";

const COLORS = {
  primary: "#0093DD",
  secondary: "#32AFE7",
  white: "#FFFFFF",
  text: "#102A43",
  muted: "#64748B",
  border: "#DCEAF2",
  danger: "#DC2626",
  success: "#16A34A",
  softBlue: "#E8F7FD",
};

type Coords = { lat: number; lng: number };

type Props = {
  studentId: string;
  studentName?: string;
  onSuccess?: () => void;
};

export default function StudentClockInForm({
  studentId,
  studentName,
  onSuccess,
}: Props) {
  const clockIn = useStudentClockIn();

  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  console.log("[StudentClockInForm] Rendered", { studentId, studentName, coords });

  const captureLocation = async () => {
    console.log("[StudentClockInForm] Requesting location permission");
    setLocating(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.warn("[StudentClockInForm] Location permission denied");
        setLocationError("Location permission denied.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const next: Coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      console.log("[StudentClockInForm] Location captured:", next);
      setCoords(next);
    } catch (error) {
      console.error("[StudentClockInForm] Location capture failed:", error);
      setLocationError("Could not get current location.");
    } finally {
      setLocating(false);
    }
  };

  const clearLocation = () => {
    console.log("[StudentClockInForm] Location cleared");
    setCoords(null);
    setLocationError(null);
  };

  const submit = async () => {
    const payload = {
      ...(coords ? { gps: coords } : {}),
      deviceInfo: "Staff-assisted mobile clock-in",
    };

    console.log("[StudentClockInForm] Clock-in payload:", { studentId, payload });

    try {
      const response = await clockIn.mutateAsync({ studentId, payload });

      console.log("[StudentClockInForm] Clock-in success:", response);

      const notification = response?.data?.parentNotification;

      Alert.alert(
        "Student clocked in",
        notification
          ? `Parent notification sent: ${notification.sent}, failed: ${notification.failed}.`
          : "The student has been clocked in successfully.",
        [{ text: "Done", onPress: onSuccess }]
      );
    } catch (error: any) {
      console.error("[StudentClockInForm] Clock-in failed:", error);

      Alert.alert(
        "Could not clock in",
        error?.response?.data?.message || error?.message || "Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.studentCard}>
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>
            {(studentName || "S").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {studentName || "Selected student"}
          </Text>
          <Text style={styles.studentMeta} numberOfLines={1}>
            ID: {studentId}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
        </View>

        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>Location (optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Attach GPS to verify the clock-in location.
          </Text>
        </View>
      </View>

      {coords ? (
        <View style={styles.locationCard}>
          <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />

          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>Location captured</Text>
            <Text style={styles.locationValue}>
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </Text>
          </View>

          <Pressable onPress={clearLocation}>
            <Ionicons name="close-circle-outline" size={22} color={COLORS.danger} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={captureLocation}
          disabled={locating}
          style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
        >
          {locating ? (
            <>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.locationButtonText}>Getting location...</Text>
            </>
          ) : (
            <>
              <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
              <Text style={styles.locationButtonText}>Use current location</Text>
            </>
          )}
        </Pressable>
      )}

      {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={clockIn.isPending}
        style={({ pressed }) => [
          styles.submitButton,
          clockIn.isPending && styles.disabled,
          pressed && !clockIn.isPending && styles.pressed,
        ]}
      >
        {clockIn.isPending ? (
          <>
            <ActivityIndicator color={COLORS.white} />
            <Text style={styles.submitText}>Clocking in...</Text>
          </>
        ) : (
          <>
            <Ionicons name="time-outline" size={21} color={COLORS.white} />
            <Text style={styles.submitText}>Clock student in</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  studentAvatarText: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  studentInfo: { flex: 1, marginLeft: 12 },
  studentName: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  studentMeta: { color: "rgba(255,255,255,0.82)", fontSize: 12, marginTop: 3 },
  sectionHeader: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.softBlue,
  },
  sectionText: { flex: 1, marginLeft: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  sectionSubtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  locationButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 15,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.secondary,
    backgroundColor: "#FAFDFF",
  },
  locationButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: "800" },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 13,
  },
  locationText: { flex: 1, marginLeft: 10 },
  locationTitle: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  locationValue: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  errorText: { color: COLORS.danger, fontSize: 12 },
  submitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    elevation: 4,
  },
  submitText: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
});
