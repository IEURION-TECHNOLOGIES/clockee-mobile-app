import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import BottomNav from "../../../../../components/BottomNav";

/* ===== TAB CONTENT ===== */
import OverviewTab from "./overview/Overview";
import AdminsTab from "./admins/Admins";
import BranchesTab from "./branches/Branches";
import SettingsTab from "./settings";

import { getInstitutions } from "@/services/superAdminServices";

type TabKey = "overview" | "admins" | "branches" | "settings";

export default function InstitutionDetails() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ALL + FIND ================= */
  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        setLoading(true);

        const res = await getInstitutions();
        const list = res?.data?.institutions || [];

        const found = list.find(
          (item: any) => item._id === institutionId
        );

        if (!found) {
          console.log("Institution not found");
          return;
        }

        setInstitution({
          id: found._id,
          name: found.name,
          status: found.isActive ? "active" : "disabled",
          logo:
            found.logo ||
            `https://ui-avatars.com/api/?name=${found.name}`,
          country: found.country || "Nigeria",
          state: found.state || "N/A",
          city: found.city || "N/A",
          timezone: found.timezone || "Africa/Lagos (GMT+1)",
        });
      } catch (err) {
        console.log("Fetch Institution Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (institutionId) fetchInstitution();
  }, [institutionId]);

  /* ================= TAB CONTENT ================= */
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab institutionId={institutionId} />;
      case "admins":
        return <AdminsTab institutionId={institutionId} />;
      case "branches":
        return <BranchesTab institutionId={institutionId} />;
      case "settings":
        return <SettingsTab institutionId={institutionId} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Institution</Text>

        <View style={{ width: 22 }} />
      </View>

      {/* ================= PROFILE CARD ================= */}
      {loading ? (
        <View style={styles.profileCard}>
          <View style={styles.skeletonLogo} />
          <View style={{ flex: 1 }}>
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLineLong} />
          </View>
        </View>
      ) : institution ? (
        <View style={styles.profileCard}>
          <Image source={{ uri: institution.logo }} style={styles.logo} />

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.instName}>{institution.name}</Text>

              <View
                style={[
                  styles.statusBadge,
                  institution.status === "active"
                    ? styles.activeBadge
                    : styles.disabledBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    institution.status === "active"
                      ? styles.activeText
                      : styles.disabledText,
                  ]}
                >
                  {institution.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <InfoRow icon="location-outline">
              {institution.city}, {institution.state}, {institution.country}
            </InfoRow>

            <InfoRow icon="time-outline">
              {institution.timezone}
            </InfoRow>
          </View>
        </View>
      ) : (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Institution not found
        </Text>
      )}

      {/* ================= TABS ================= */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            active={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderTabContent()}
      </ScrollView>

      <BottomNav dashboardType="superAdmin" />
    </View>
  );
}

/* ================= TAB CONFIG ================= */
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "admins", label: "Admins" },
  { key: "branches", label: "Branches" },
  { key: "settings", label: "Settings" },
];

/* ================= TAB BUTTON ================= */
function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ================= INFO ROW ================= */
function InfoRow({
  icon,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={14} color="#64748B" />
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
  },

  headerTitle: { fontSize: 16, fontWeight: "700" },

  profileCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
  },

  logo: { width: 64, height: 64, borderRadius: 16 },

  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  instName: { fontSize: 15, fontWeight: "800", flex: 1 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "700" },

  activeBadge: { backgroundColor: "#DCFCE7" },
  disabledBadge: { backgroundColor: "#FEE2E2" },
  activeText: { color: "#166534" },
  disabledText: { color: "#991B1B" },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 12, color: "#64748B" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },

  tabActive: { backgroundColor: "#FFFFFF" },

  tabText: { fontSize: 12, color: "#64748B" },
  tabTextActive: { color: "#0284C7", fontWeight: "700" },

  content: { paddingBottom: 100 },

  /* skeleton */
  skeletonLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  skeletonLineShort: {
    width: "60%",
    height: 12,
    backgroundColor: "#E2E8F0",
    marginBottom: 6,
    borderRadius: 6,
  },
  skeletonLineLong: {
    width: "40%",
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
  },
});


