import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminProfile() {
  const router = useRouter();

  const { admin, institutionId } = useLocalSearchParams<{
    admin: string;
    institutionId: string;
  }>();

  const parsedAdmin = admin ? JSON.parse(admin) : null;

  if (!parsedAdmin) {
    return (
      <View style={styles.center}>
        <Text>Admin not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HERO HEADER */}
      <LinearGradient colors={["#0284C7", "#0F172A"]} style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname:
                  "/dashboard/superAdminDashboard/institution/[institutionId]/admins/edit-admin",
                params: {
                  institutionId,
                  admin: JSON.stringify(parsedAdmin),
                },
              })
            }
          >
            <Ionicons name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {parsedAdmin.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{parsedAdmin.name}</Text>
        <Text style={styles.role}>{parsedAdmin.role}</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <InfoRow icon="mail-outline" label="Email" value={parsedAdmin.email} />
          <InfoRow icon="shield-outline" label="Status" value={parsedAdmin.status} />
          <InfoRow
            icon="git-branch-outline"
            label="Branch"
            value={parsedAdmin.branch || "N/A"}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* INFO ROW */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color="#0284C7" />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },

  hero: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    alignItems: "center",
  },

  header: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0284C7",
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },

  role: {
    fontSize: 13,
    marginTop: 4,
    color: "#E0F2FE",
    fontWeight: "600",
  },

  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 20,
    padding: 16,
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },

  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});