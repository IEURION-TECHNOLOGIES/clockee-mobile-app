import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
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
import ActivityLogsTab from "./logs/ActivityLogs";
import SettingsTab from "./settings";
import StaffTab from "./staff";
import StudentsTab from "./students/Students";

type TabKey =
  | "branches"
  | "staff"
  | "students"
  | "admins"
  | "logs"
  | "settings";

type TimeFilter = "today" | "week" | "month" | "year";

type TabConfig = {
  key: Exclude<TabKey, "settings">;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const COLORS = {
  primary: "#0093DD",
  secondary: "#32AFE7",
  white: "#FFFFFF",
  background: "#F8FAFC",
  text: "#0F172A",
  muted: "#64748B",
  lightMuted: "#94A3B8",
  border: "#E2E8F0",
  softBlue: "#E8F7FD",
  softBlueStrong: "#DDF4FF",
  success: "#10B981",
};

const TABS: TabConfig[] = [
  {
    key: "branches",
    label: "Branches",
    icon: "git-branch-outline",
  },
  {
    key: "staff",
    label: "Staff",
    icon: "people-outline",
  },
  {
    key: "students",
    label: "Students",
    icon: "school-outline",
  },
  {
    key: "admins",
    label: "Admins",
    icon: "shield-outline",
  },
  {
    key: "logs",
    label: "Logs",
    icon: "document-text-outline",
  },
];

export default function InstitutionDetails() {
  const { institutionId: paramInstitutionId } = useLocalSearchParams<{
    institutionId?: string;
  }>();

  const [activeTab, setActiveTab] = useState<TabKey>("branches");
  const [timeFilter] = useState<TimeFilter>("week");

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfile();

  const institutionId = paramInstitutionId || profile?.institutionId;

  const branchesQuery = useInstitutionBranches(institutionId, {
    enabled: Boolean(institutionId),
    retry: false,
  });

  const {
    data: branches = [],
    isLoading: branchesLoading,
    isError: branchesError,
  } = branchesQuery;

  const isLoading = profileLoading || (Boolean(institutionId) && branchesLoading);

  const institutionName = profile?.institutionName || "My Institution";

  const institution = {
    id: institutionId,
    name: institutionName,
    logo:
      profile?.institutionLogo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        institutionName
      )}&background=0093DD&color=FFFFFF&bold=true`,
    status: "active",
  };

  console.log("[InstitutionDetails] Rendered", {
    activeTab,
    institutionId,
    institutionName,
    branchCount: branches.length,
    profileError,
    branchesError,
  });

  const handleTabChange = (tab: TabKey) => {
    console.log("[InstitutionDetails] Tab changed:", tab);
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    console.log("[InstitutionDetails] Rendering tab:", activeTab);

    switch (activeTab) {
      case "branches":
        return <BranchesTab institutionId={institutionId} />;

      case "staff":
        return <StaffTab institutionId={institutionId} />;

      case "students":
        return <StudentsTab institutionId={institutionId} />;

      case "admins":
        return <AdminsTab institutionId={institutionId} />;

      case "logs":
        return (
          <ActivityLogsTab
            institutionId={institutionId}
            timeFilter={timeFilter}
          />
        );

      case "settings":
        return <SettingsTab institutionId={institutionId} />;

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>

        <Text style={styles.loadingTitle}>Loading institution</Text>
        <Text style={styles.loadingText}>
          Fetching institution details and branches.
        </Text>
      </View>
    );
  }

  if (!institutionId) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="business-outline"
            size={38}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.loadingTitle}>No institution found</Text>

        <Text style={styles.loadingText}>
          Your profile does not contain an institution ID.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================= INSTITUTION HEADER ================= */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: institution.logo }}
            style={styles.headerLogo}
            resizeMode="cover"
          />

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
                {branches.length}{" "}
                {branches.length === 1 ? "Branch" : "Branches"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            styles.settingsButton,
            activeTab === "settings" && styles.settingsButtonActive,
          ]}
          onPress={() => handleTabChange("settings")}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={
              activeTab === "settings"
                ? COLORS.primary
                : COLORS.muted
            }
          />
        </TouchableOpacity>
      </View>

      {/* ================= OWNER TABS ================= */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.75}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabChange(tab.key)}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isActive ? COLORS.primary : COLORS.lightMuted}
                  />

                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </View>

                {isActive ? <View style={styles.activeIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= SETTINGS TITLE ================= */}
      {activeTab === "settings" ? (
        <View style={styles.settingsHeader}>
          <View style={styles.settingsHeaderIcon}>
            <Ionicons
              name="settings-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <View>
            <Text style={styles.settingsHeaderTitle}>Institution settings</Text>
            <Text style={styles.settingsHeaderText}>
              Configure institution preferences and details.
            </Text>
          </View>
        </View>
      ) : null}

      {/* ================= TAB CONTENT ================= */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderTabContent()}
      </ScrollView>

      <BottomNav dashboardType="owner" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },

  errorIcon: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },

  loadingTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  headerLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },

  headerText: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },

  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },

  statusText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "700",
  },

  separator: {
    color: "#CBD5E1",
    fontSize: 12,
    marginHorizontal: 7,
  },

  branchCount: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  settingsButtonActive: {
    backgroundColor: COLORS.softBlue,
    borderWidth: 1,
    borderColor: "#BCE9FA",
  },

  /* ================= TABS ================= */

  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },

  tab: {
    minWidth: 102,
    minHeight: 54,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  tabActive: {
    backgroundColor: COLORS.softBlue,
  },

  tabContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  tabText: {
    color: COLORS.lightMuted,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },

  tabTextActive: {
    color: COLORS.primary,
  },

  activeIndicator: {
    position: "absolute",
    left: 11,
    right: 11,
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: COLORS.primary,
  },

  /* ================= SETTINGS ================= */

  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: COLORS.white,
  },

  settingsHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginRight: 10,
  },

  settingsHeaderTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },

  settingsHeaderText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  /* ================= CONTENT ================= */

  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
    paddingBottom: 28,
    backgroundColor: COLORS.background,
  },
});
