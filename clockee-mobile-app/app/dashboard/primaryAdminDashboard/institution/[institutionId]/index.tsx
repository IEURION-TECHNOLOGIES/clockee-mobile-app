import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

type TabKey =  "admins" | "branches" | "settings";

export default function InstitutionDetails() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  const [activeTab, setActiveTab] = useState<TabKey>("branches");

  /* ===== MOCK DATA (replace with API later) ===== */
  const institution = useMemo(
    () => ({
      id: institutionId,
      name: "Greenwood International Academy",
      status: "active",
      logo:
        "https://ui-avatars.com/api/?name=Greenwood&background=0284C7&color=fff",
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      timezone: "Africa/Lagos (GMT+1)",
    }),
    [institutionId]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "branches":
        return <BranchesTab institutionId={institutionId} />;
      case "admins":
        return <AdminsTab institutionId={institutionId} />;
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
        
       
      </View>

      {/* ================= PROFILE CARD ================= */}
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

          <InfoRow icon="time-outline">{institution.timezone}</InfoRow>
        </View>
      </View>

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

     <BottomNav dashboardType="owner" />
    </View>
  );
}

/* ================= TAB CONFIG ================= */
const TABS: { key: TabKey; label: string }[] = [
  { key: "branches", label: "Branches" },
  { key: "admins", label: "Admins" },
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
      activeOpacity={0.8}
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

/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
  },

  iconBtn: {
    padding: 6,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  /* PROFILE CARD */
  profileCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  instName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    paddingRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeBadge: { backgroundColor: "#DCFCE7" },
  disabledBadge: { backgroundColor: "#FEE2E2" },
  activeText: { color: "#166534" },
  disabledText: { color: "#991B1B" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  infoText: {
    fontSize: 12,
    color: "#64748B",
  },

  /* TABS */
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

  tabActive: {
    backgroundColor: "#FFFFFF",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  tabTextActive: {
    color: "#0284C7",
  },

  content: {
    paddingBottom: 100,
  },
});