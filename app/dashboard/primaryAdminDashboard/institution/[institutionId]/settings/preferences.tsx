import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function InstitutionPreferences() {
  /* ================= STATE ================= */
  const [workingDays, setWorkingDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);

  const [settings, setSettings] = useState({
    enableBranches: true,
    enableDepartments: true,
    publicRegistration: false,
    allowMultipleLocations: false,
    qrStatic: true,
    qrDynamic: false,
    remoteClockIn: false,
  });

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ================= TIME & ATTENDANCE ================= */}
      <Section title="Time & Attendance Work Settings">
        <Label>Working Days</Label>
        <View style={styles.daysRow}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDay(day)}
              style={[
                styles.dayChip,
                workingDays.includes(day) && styles.dayActive,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  workingDays.includes(day) && styles.dayTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label>Default Work Start Time</Label>
        <TextInput style={styles.input} placeholder="08:00 AM" />

        <Label>Default Work End Time</Label>
        <TextInput style={styles.input} placeholder="05:00 PM" />

        <Label>Grace Period (Minutes)</Label>
        <Text style={styles.hint}>
          Time allowed after work start time before marking as late
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="15"
        />

        <Label>Time Zone</Label>
        <TextInput
          style={styles.input}
          value="WAT (West Africa Time)"
          editable={false}
        />
      </Section>

      {/* ================= ADVANCED OPTIONS ================= */}
      <Section title="Advanced">
        <Toggle
          label="Enable Branches"
          value={settings.enableBranches}
          onToggle={() => toggle("enableBranches")}
        />

        <Toggle
          label="Enable Departments / Units"
          value={settings.enableDepartments}
          onToggle={() => toggle("enableDepartments")}
        />

        <Toggle
          label="Enable Public Staff Registration"
          value={settings.publicRegistration}
          onToggle={() => toggle("publicRegistration")}
        />
      </Section>

      {/* ================= WORK RULES ================= */}
      <Section title="Work Rules">
        <Toggle
          label="Allow Multiple Locations"
          value={settings.allowMultipleLocations}
          onToggle={() => toggle("allowMultipleLocations")}
        />

        <Label>QR Code</Label>

        <Toggle
          label="Static QR Code"
          value={settings.qrStatic}
          onToggle={() => toggle("qrStatic")}
        />

        <Toggle
          label="Dynamic QR Code"
          value={settings.qrDynamic}
          onToggle={() => toggle("qrDynamic")}
        />

        <Toggle
          label="Enable Remote Clock-In Capability"
          value={settings.remoteClockIn}
          onToggle={() => toggle("remoteClockIn")}
        />
      </Section>

      {/* ================= SAVE ================= */}
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Toggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
}

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
    marginTop: 40
  },

  section: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0F172A",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },

  hint: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 8,
  },

  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },

  dayActive: {
    backgroundColor: "#0284C7",
  },

  dayText: {
    fontSize: 12,
    color: "#334155",
  },

  dayTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  saveBtn: {
    backgroundColor: "#0284C7",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 20,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});