// ======================= index.tsx =======================

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useBranchOverview } from "@/hooks/useAdminDashboard";

import Staff from "./staff";
import BranchAttendance from "./logs";
import StudentsTab from "./students/Students";

/* ================= COLORS ================= */

const PRIMARY = "#0093DD";
const PRIMARY_DARK = "#0284C7";
const PRIMARY_LIGHT = "#32AFE7";
const PRIMARY_SOFT = "#EAF8FE";
const PRIMARY_BORDER = "#B8E7F8";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  success: "#047857",
  successLight: "#ECFDF5",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  warning: "#B45309",
  warningLight: "#FFFBEB",
};

/* ================= TYPES ================= */

type BranchTab =
  | "staff"
  | "Attendance"
  | "Students";

type Branch = {
  _id: string;
  name: string;
  address?: string;
  status?: string;
  radiusMeters?: number;
};

type Admin = {
  _id: string;
  name: string;
  email: string;
  role: string[];
};

type BranchOverview = {
  branch: Branch;
  admin: Admin;
  todaySummary?: unknown;
  staff?: unknown[];
  departments?: unknown[];
  weeklyTrend?: unknown[];
  generatedAt?: string;
};

/* ================= SCREEN ================= */

export default function BranchIndexScreen() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    initialized: authInitialized,
  } = useAuth();

  const [activeTab, setActiveTab] =
    useState<BranchTab>("staff");

  const institutionId =
    user?.institutionId || null;

  const branchId =
    user?.branchId || null;

  const {
    data: rawOverview,
    isLoading: dashboardLoading,
    error,
    refetch,
  } = useBranchOverview(branchId);

  const overview =
    rawOverview as BranchOverview | undefined;

  /* ================= AUTH LOADING ================= */

  if (
    authLoading ||
    !authInitialized
  ) {
    return (
      <LoadingState message="Loading account..." />
    );
  }

  /* ================= NO USER ================= */

  if (!user) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="person-outline"
            size={32}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.errorTitle}>
          Account unavailable
        </Text>

        <Text style={styles.errorDescription}>
          Please log in again to continue.
        </Text>
      </View>
    );
  }

  /* ================= MISSING IDS ================= */

  if (!institutionId || !branchId) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="business-outline"
            size={32}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.errorTitle}>
          Branch parameters missing
        </Text>

        <Text style={styles.errorDescription}>
          Your account does not have a valid
          institution ID or branch ID.
        </Text>

        <Text style={styles.debugText}>
          Institution:{" "}
          {institutionId || "missing"}
        </Text>

        <Text style={styles.debugText}>
          Branch: {branchId || "missing"}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ================= DASHBOARD LOADING ================= */

  if (dashboardLoading) {
    return (
      <LoadingState
        message="Loading branch..."
        branchId={branchId}
      />
    );
  }

  /* ================= API ERROR ================= */

  if (error || !overview) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.errorTitle}>
          Branch unavailable
        </Text>

        <Text style={styles.errorDescription}>
          {error?.message ||
            "We could not load this branch."}
        </Text>

        <Text style={styles.debugText}>
          Branch ID: {branchId}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  const branch = overview.branch;
  const admin = overview.admin;

  const branchIsActive =
    branch.status?.toLowerCase() ===
    "active";

  return (
    <View style={styles.screen}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <View style={styles.headerTopRow}>

          <View style={styles.headerBranch}>
            <Text style={styles.headerEyebrow}>
              MY BRANCH
            </Text>

            <Text
              style={styles.headerBranchName}
              numberOfLines={1}
            >
              {branch.name}
            </Text>
          </View>

          <Pressable
            style={styles.adminHeader}
            onPress={() =>
              router.push(
                "/dashboard/adminDashboard/profile"
              )
            }
          >
            <View style={styles.adminHeaderText}>
              <Text
                style={styles.adminName}
                numberOfLines={1}
              >
                {admin?.name || "Admin"}
              </Text>

              <Text style={styles.adminRole}>
                Branch admin
              </Text>
            </View>

            <View style={styles.adminAvatar}>
              <Ionicons
                name="person"
                size={20}
                color={PRIMARY}
              />
            </View>
          </Pressable>

        </View>

        <View style={styles.branchMetaRow}>

          <View style={styles.branchIcon}>
            <Ionicons
              name="business-outline"
              size={22}
              color={PRIMARY}
            />
          </View>

          <View style={styles.branchMetaContent}>

            <Text
              style={styles.branchAddress}
              numberOfLines={2}
            >
              {branch.address ||
                "No address added"}
            </Text>

            <View style={styles.statusRow}>

              <View
                style={[
                  styles.statusDot,
                  branchIsActive
                    ? styles.activeDot
                    : styles.disabledDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  !branchIsActive &&
                    styles.disabledStatusText,
                ]}
              >
                {branchIsActive
                  ? "Branch active"
                  : "Branch disabled"}
              </Text>

              <Text style={styles.radiusText}>
                Radius:{" "}
                {branch.radiusMeters || 100}m
              </Text>

            </View>

          </View>
        </View>
      </View>

      {/* ================= TABS ================= */}

      <View style={styles.tabsWrapper}>

        <TabButton
          label="Staff"
          icon="people-outline"
          active={activeTab === "staff"}
          onPress={() =>
            setActiveTab("staff")
          }
        />

        <TabButton
          label="Attendance"
          icon="document-text-outline"
          active={activeTab === "Attendance"}
          onPress={() =>
            setActiveTab("Attendance")
          }
        />

        <TabButton
          label="Students"
          icon="school-outline"
          active={activeTab === "Students"}
          onPress={() =>
            setActiveTab("Students")
          }
        />

      </View>

      {/* ================= CONTENT ================= */}

      {activeTab === "staff" && (
        <Staff
          institutionId={institutionId}
          branchId={branchId}
          branchName={branch.name}
        />
      )}

      {activeTab === "Attendance" && (
        <View style={styles.attendanceContent}>
          <BranchAttendance
            branchId={branchId}
          />
        </View>
      )}

      {activeTab === "Students" && (
        <View style={styles.studentsContent}>
          <StudentsTab
            institutionId={institutionId}
          />
        </View>
      )}

    </View>
  );
}

/* ================= LOADING ================= */

function LoadingState({
  message,
  branchId,
}: {
  message: string;
  branchId?: string | null;
}) {
  return (
    <View style={styles.center}>

      <View style={styles.loadingIcon}>
        <ActivityIndicator
          size="large"
          color={PRIMARY}
        />
      </View>

      <Text style={styles.loadingText}>
        {message}
      </Text>

      {branchId && (
        <Text style={styles.debugText}>
          Branch ID: {branchId}
        </Text>
      )}

    </View>
  );
}

/* ================= TAB BUTTON ================= */

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.tabButton,
        active && styles.tabButtonActive,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          active
            ? COLORS.white
            : PRIMARY
        }
      />

      <Text
        style={[
          styles.tabText,
          active && styles.tabTextActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  /* ================= HEADER ================= */

  header: {
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 19,
    backgroundColor:
      COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerBranch: {
    flex: 1,
    marginLeft: 11,
  },

  headerEyebrow: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerBranchName: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  adminHeaderText: {
    alignItems: "flex-end",
    marginRight: 7,
  },

  adminName: {
    maxWidth: 100,
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "900",
  },

  adminRole: {
    marginTop: 2,
    color: PRIMARY,
    fontSize: 8,
    fontWeight: "800",
  },

  adminAvatar: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      PRIMARY_SOFT,
    borderWidth: 2,
    borderColor:
      PRIMARY_BORDER,
    borderRadius: 19,
  },

  /* ================= BRANCH META ================= */

  branchMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  branchIcon: {
    width: 47,
    height: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      PRIMARY_SOFT,
    borderWidth: 1,
    borderColor:
      PRIMARY_BORDER,
    borderRadius: 15,
  },

  branchMetaContent: {
    flex: 1,
    marginLeft: 10,
  },

  branchAddress: {
    color: "#475569",
    fontSize: 11,
    lineHeight: 16,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    borderRadius: 5,
  },

  activeDot: {
    backgroundColor:
      "#10B981",
  },

  disabledDot: {
    backgroundColor:
      "#F97316",
  },

  statusText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "800",
  },

  disabledStatusText: {
    color: "#C2410C",
  },

  radiusText: {
    marginLeft: 12,
    color: COLORS.muted,
    fontSize: 10,
  },

  /* ================= TABS ================= */

  tabsWrapper: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 4,
    backgroundColor:
      PRIMARY_SOFT,
    borderWidth: 1,
    borderColor:
      PRIMARY_BORDER,
    borderRadius: 15,
  },

  tabButton: {
    flex: 1,
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderRadius: 12,
  },

  tabButtonActive: {
    backgroundColor: PRIMARY,
    elevation: 3,
  },

  tabText: {
    maxWidth: 100,
    marginLeft: 5,
    color: "#475569",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  tabTextActive: {
    color: COLORS.white,
  },

  /* ================= ATTENDANCE ================= */

  attendanceContent: {
    flex: 1,
    paddingTop: 4,
  },

  /* ================= STUDENTS ================= */

  studentsContent: {
    flex: 1,
    paddingTop: 4,
  },

  /* ================= LOADING ================= */

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor:
      COLORS.background,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      PRIMARY_SOFT,
    borderRadius: 22,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 13,
  },

  /* ================= ERROR ================= */

  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.dangerLight,
    borderRadius: 21,
  },

  errorTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  errorDescription: {
    maxWidth: 280,
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  debugText: {
    marginTop: 5,
    color: COLORS.subtle,
    fontSize: 11,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 19,
    paddingVertical: 11,
    backgroundColor: PRIMARY,
    borderRadius: 11,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
});
