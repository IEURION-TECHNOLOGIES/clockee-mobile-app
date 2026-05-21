import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNav from "../../../../../components/BottomNav";

import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";
import { useProfile } from "@/hooks/useProfile";
import AdminsTab from "./admins/Admins";
import BranchesTab from "./branches/Branches";
import SettingsTab from "./settings";
/* ===== TAB CONTENT ===== */


type TabKey = "branches" | "settings";

export default function InstitutionDetails() {
  const router = useRouter();
  const { institutionId: paramInstitutionId } = useLocalSearchParams<{ institutionId?: string }>();

  const [activeTab, setActiveTab] = useState<TabKey>("branches");

  // Get profile (Owner's data)
  console.log("========== INSTITUTION DETAILS ==========");
console.log("📌 paramInstitutionId:", paramInstitutionId);

const {
  data: profile,
  isLoading: profileLoading,
  error: profileError,
} = useProfile();

console.log("👤 PROFILE:", profile);
console.log("⏳ profileLoading:", profileLoading);
console.log("❌ profileError:", profileError);

// Use params first, fallback to profile
const institutionId =
  paramInstitutionId || profile?.institutionId;

console.log("🏢 FINAL institutionId:", institutionId);

// IMPORTANT FIX
const branchesQuery = useInstitutionBranches(institutionId, {
  enabled: !!institutionId,
  retry: false,
});

const {
  data: branches = [],
  isLoading: branchesLoading,
  error: branchesError,
  isFetching,
} = branchesQuery;

console.log("🌿 branches:", branches);
console.log("⏳ branchesLoading:", branchesLoading);
console.log("🔄 branchesFetching:", isFetching);
console.log("❌ branchesError:", branchesError);

const isLoading =
  profileLoading ||
  (!!institutionId && branchesLoading);

console.log("🔥 FINAL isLoading:", isLoading);
console.log("================================");

  // Institution Info
  const institution = {
    id: institutionId,
    name: profile?.institutionName || "My Institution",
    logo: profile?.institutionLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.institutionName || "Inst")}&background=0284C7&color=fff`,
    status: "active",
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={{ marginTop: 12 }}>Loading institution...</Text>
      </View>
    );
  }

  if (!institutionId) {
    return (
      <View style={styles.center}>
        <Text>No institution found</Text>
      </View>
    );
  }

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
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Institution</Text>
      </View>

      {/* INSTITUTION PROFILE CARD */}
      <View style={styles.profileCard}>
        <Image source={{ uri: institution.logo }} style={styles.logo} />

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.instName}>{institution.name}</Text>
            <View style={[styles.statusBadge, styles.activeBadge]}>
              <Text style={[styles.statusText, styles.activeText]}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="git-branch-outline" size={16} color="#64748B" />
            <Text style={styles.infoText}>
              {branches.length} Branch{branches.length !== 1 ? "es" : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* TABS */}
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

      {/* TAB CONTENT */}
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

/* ================= REUSABLE COMPONENTS ================= */
function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
  },
  iconBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A", marginTop: 10 },

  profileCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  logo: { width: 72, height: 72, borderRadius: 16 },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  instName: { fontSize: 18, fontWeight: "800", color: "#0F172A", flex: 1 },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: "#DCFCE7" },
  statusText: { fontSize: 12, fontWeight: "700" },
  activeText: { color: "#166534" },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  infoText: { fontSize: 14, color: "#64748B" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#FFFFFF" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  tabTextActive: { color: "#0284C7" },

  content: { paddingBottom: 100 },
});


