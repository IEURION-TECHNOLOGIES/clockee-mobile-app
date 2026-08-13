import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";

export default function SettingsIndex() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  const [isDeactivated, setIsDeactivated] = useState(false);

  if (!institutionId) return null;

  /* ================= CONFIRM HELPERS ================= */
  const confirmToggle = (nextValue: boolean) => {
    Alert.alert(
      nextValue ? "Deactivate Institution" : "Reactivate Institution",
      nextValue
        ? "This will temporarily block all access (no logins, no clock-ins)."
        : "This will restore access to the institution.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: nextValue ? "destructive" : "default",
          onPress: () => {
            setIsDeactivated(nextValue);

            // 🔗 API READY
            console.log("TOGGLE DEACTIVATE:", {
              institutionId,
              deactivated: nextValue,
            });
          },
        },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Institution",
      "This action is irreversible. All data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("DELETE INSTITUTION:", institutionId);
            // 🔗 API CALL LATER
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Institution Settings</Text>

      {/* ================= GENERAL ================= */}
      <Text style={styles.section}>General</Text>

      <Item
        icon="create-outline"
        title="Edit Institution Details"
        desc="Name, address, metadata"
        onPress={() =>
          router.push(
            `/dashboard/superAdminDashboard/institution/${institutionId}/settings/edit`
          )
        }
      />

      <Item
        icon="options-outline"
        title="Institution Preferences"
        desc="Attendance & defaults"
        onPress={() =>
          router.push(
            `/dashboard/superAdminDashboard/institution/${institutionId}/settings/preferences`
          )
        }
      />

      {/* ================= SECURITY ================= */}
      <Text style={styles.section}>Security</Text>

      <Item
        icon="shield-checkmark-outline"
        title="Security Policies"
        desc="Access & compliance"
        onPress={() =>
          router.push(
            `/dashboard/superAdminDashboard/institution/${institutionId}/settings/security`
          )
        }
      />

      <Item
        icon="document-text-outline"
        title="Audit Logs"
        desc="Institution activity"
        onPress={() =>
          router.push(
            `/dashboard/superAdminDashboard/institution/${institutionId}/settings/audit`
          )
        }
      />

      {/* ================= DANGER ZONE ================= */}
      <Text style={styles.dangerSection}>Danger Zone</Text>

      {/* DEACTIVATE TOGGLE */}
      <View style={[styles.item, styles.dangerItem]}>
        <View style={styles.left}>
          <Ionicons name="power-outline" size={20} color="#DC2626" />
          <View>
            <Text style={styles.dangerTitle}>
              {isDeactivated
                ? "Institution Deactivated"
                : "Deactivate Institution"}
            </Text>
            <Text style={styles.desc}>
              Temporarily blocks access (no logins, no clock-ins)
            </Text>
          </View>
        </View>

        <Switch
          value={isDeactivated}
          onValueChange={(value) => confirmToggle(value)}
          trackColor={{ false: "#CBD5E1", true: "#FCA5A5" }}
          thumbColor={isDeactivated ? "#DC2626" : "#FFFFFF"}
        />
      </View>

      {/* DELETE */}
      <TouchableOpacity
        style={[styles.item, styles.dangerItem]}
        onPress={confirmDelete}
      >
        <View style={styles.left}>
          <Ionicons name="warning-outline" size={20} color="#DC2626" />
          <View>
            <Text style={styles.dangerTitle}>Delete Institution</Text>
            <Text style={styles.desc}>Permanent removal (irreversible)</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= COMPONENT ================= */

function Item({ icon, title, desc, onPress }: any) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color="#0284C7" />
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748B" />
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    flex: 1,
    marginTop: 40
  },

  header: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 20,
    color: "#0F172A",
  },

  section: {
    fontSize: 14,
    fontWeight: "700",
    marginVertical: 10,
    color: "#0F172A",
  },

  dangerSection: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginTop: 24,
    marginBottom: 10,
  },

  item: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dangerItem: {
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  left: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  dangerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },

  desc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});