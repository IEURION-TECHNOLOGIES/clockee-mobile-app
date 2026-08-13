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
import StaffTab from "./staff";
import ActivityLogsTab from "./logs/ActivityLogs";

type TabKey = "branches" | "staff" | "admins" | "logs" | "settings";


export default function InstitutionDetails() {
  const router = useRouter();
  const { institutionId: paramInstitutionId } = useLocalSearchParams<{ institutionId?: string }>();

  const [activeTab, setActiveTab] = useState<TabKey>("branches");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");

  const {
    data: profile,
    isLoading: profileLoading,
  } = useProfile();

  const institutionId = paramInstitutionId || profile?.institutionId;

  const branchesQuery = useInstitutionBranches(institutionId, {
    enabled: !!institutionId,
    retry: false,
  });

  const {
    data: branches = [],
    isLoading: branchesLoading,
  } = branchesQuery;

  const isLoading = profileLoading || (!!institutionId && branchesLoading);

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
        <Text style={{ marginTop: 12, color: "#64748B" }}>Loading institution...</Text>
      </View>
    );
  }

  if (!institutionId) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#64748B" }}>No institution found</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "branches":
        return <BranchesTab institutionId={institutionId} />;
      case "staff":
        return <StaffTab institutionId={institutionId} />;
      case "admins":
        return <AdminsTab institutionId={institutionId} />;
      case "logs":
        return <ActivityLogsTab institutionId={institutionId} timeFilter={timeFilter} />;
      case "settings":
        return <SettingsTab institutionId={institutionId} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER WITH INSTITUTION INFO */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={{ uri: institution.logo }} style={styles.headerLogo} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {institution.name}
            </Text>
            <View style={styles.headerMeta}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.branchCount}>
                {branches.length} Branch{branches.length !== 1 ? "es" : ""}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.settingsButton,
            activeTab === "settings" && styles.settingsButtonActive,
          ]}
          onPress={() => setActiveTab("settings")}
        >
          <Ionicons 
            name="settings-outline" 
            size={22} 
            color={activeTab === "settings" ? "#0284C7" : "#64748B"} 
          />
        </TouchableOpacity>
      </View>

      {/* FULL-WIDTH SEGMENTED TABS */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={activeTab === tab.key ? "#0284C7" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </View>
              {activeTab === tab.key && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
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
const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "branches", label: "Branches", icon: "git-branch-outline" },
  { key: "staff", label: "Staff", icon: "people-outline" },
  { key: "admins", label: "Admins", icon: "shield-outline" },
  { key: "logs", label: "Logs", icon: "document-text-outline" },
];



/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF",
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  headerLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  separator: {
    fontSize: 12,
    color: "#CBD5E1",
    marginHorizontal: 6,
  },
  branchCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButtonActive: {
    backgroundColor: "#EFF6FF",
  },

  // Tabs
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabs: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabActive: {
    backgroundColor: "#EFF6FF",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  tabTextActive: {
    color: "#0284C7",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#0284C7",
  },

  // Time Filters
  timeFilters: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  timeFilterRow: {
    flexDirection: "row",
    gap: 8,
  },
  timeFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  timeFilterActive: {
    backgroundColor: "#0284C7",
  },
  timeFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  timeFilterTextActive: {
    color: "#FFFFFF",
  },

  // Content
  content: { 
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});
