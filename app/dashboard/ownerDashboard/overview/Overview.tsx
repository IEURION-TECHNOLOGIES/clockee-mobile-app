// ======================= OwnerDashboard.tsx =======================

import React, { useMemo, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import BottomNav from "../../../../components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import {
  useOwnerDashboardOverview,
} from "@/hooks/useOwnerDashboardOverview";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  blueLight: "#EFF6FF",
  success: "#047857",
  successLight: "#ECFDF5",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  purple: "#7C3AED",
};

type IconName = keyof typeof Ionicons.glyphMap;

type RecentHire = {
  id: string;
  name: string;
  role: string | string[];
  branch: string;
  date: string;
};

type OwnerDashboardData = {
  institutionProfile: {
    id: string;
    name: string;
    type?: string;
    owner?: {
      id: string;
      name: string;
      email: string;
    };
  };

  institutionKpis: {
    totalStaff: number;
    totalAdmins: number;
    totalBranches: number;
    activeDepartments?: number;
  };

  subscription?: {
    activePlan?: string;
    billingCycle?: string;
    status?: string;
    amount?: number;
  };

  staffAttendanceToday?: {
    present?: number;
    absent?: number;
    late?: number;
    onLeave?: number;
    attendanceRate?: string;
  };

  weeklyStaffAttendance?: {
    day: string;
    attendanceRate: number;
  }[];

  branchStaffBreakdown?: {
    id: string;
    name: string;
    staffCount: number;
    attendance: string;
  }[];

  departmentStaffBreakdown?: {
    id: string;
    name: string;
    staffCount: number;
    attendance: string;
  }[];

  recentStaffHires?: RecentHire[];
};

/* ================= SCREEN ================= */

export default function OwnerDashboard() {
  const router = useRouter();

  const {
    data: profile,
    isLoading: profileLoading,
  } = useProfile();

  const {
    data: rawData,
    isLoading: dashboardLoading,
    error,
    refetch,
  } = useOwnerDashboardOverview();

  const [refreshing, setRefreshing] =
    useState(false);

  const data =
    rawData as OwnerDashboardData | undefined;

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (profileLoading || dashboardLoading) {
    return <LoadingState />;
  }

  if (error || !data) {
    return (
      <ErrorState
        onRetry={() => refetch()}
      />
    );
  }

  const {
    institutionProfile,
    institutionKpis,
    subscription,
    staffAttendanceToday,
    weeklyStaffAttendance = [],
    branchStaffBreakdown = [],
    departmentStaffBreakdown = [],
    recentStaffHires = [],
  } = data;

  /*
   * IMPORTANT ROLE LOGIC
   *
   * API:
   * totalStaff = 6
   * totalAdmins = 2
   *
   * The two admins are:
   * 1. Owner
   * 2. Promoted staff member
   *
   * Therefore:
   * Staff-only = 6 - 1 promoted staff = 5
   * Admins excluding owner = 2 - 1 owner = 1
   */
  const totalStaffFromApi = Number(
    institutionKpis?.totalStaff || 0
  );

  const totalAdminsFromApi = Number(
    institutionKpis?.totalAdmins || 0
  );

  const ownerCount =
    institutionProfile?.owner ? 1 : 0;

  const adminsExcludingOwner = Math.max(
    totalAdminsFromApi - ownerCount,
    0
  );

  /*
   * Based on your current role structure,
   * every non-owner admin is the promoted staff member.
   */
  const promotedStaffCount =
    adminsExcludingOwner;

  const staffOnlyCount = Math.max(
    totalStaffFromApi -
      promotedStaffCount,
    0
  );

  const totalUsers =
    staffOnlyCount +
    adminsExcludingOwner +
    ownerCount;

  const presentToday = Math.min(
    Number(
      staffAttendanceToday?.present || 0
    ),
    staffOnlyCount
  );

  const lateToday = Math.min(
    Number(
      staffAttendanceToday?.late || 0
    ),
    Math.max(
      staffOnlyCount - presentToday,
      0
    )
  );

  const onLeaveToday = Math.min(
    Number(
      staffAttendanceToday?.onLeave || 0
    ),
    Math.max(
      staffOnlyCount -
        presentToday -
        lateToday,
      0
    )
  );

  const absentToday = Math.max(
    staffOnlyCount -
      presentToday -
      lateToday -
      onLeaveToday,
    0
  );

  const attendanceRate =
    staffOnlyCount > 0
      ? Math.round(
          (presentToday / staffOnlyCount) * 100
        )
      : 0;

  const firstName =
    profile?.name
      ?.trim()
      .split(" ")[0] || "Owner";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.institutionBlock}>
            <View style={styles.institutionIcon}>
              <Ionicons
                name="business-outline"
                size={19}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.eyebrow}>
                OWNER DASHBOARD
              </Text>

              <Text
                style={styles.institutionName}
                numberOfLines={1}
              >
                {institutionProfile?.name ||
                  "Institution"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() =>
              router.push(
                "/dashboard/ownerDashboard/profile"
              )
            }
          >
            <Ionicons
              name="person"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>
            Good day, {firstName}
          </Text>

          <Text style={styles.subtitle}>
            Here is your institution overview.
          </Text>
        </View>

        {/* USER TOTALS */}

        <SectionHeader
          title="People overview"
          subtitle="Staff and administrator accounts"
        />

        <View style={styles.statsGrid}>
          <StatCard
            icon="people-outline"
            label="Staff only"
            value={staffOnlyCount}
            description="Excludes promoted admins"
            colors={["#2563EB", "#1D4ED8"]}
          />

          <StatCard
            icon="shield-checkmark-outline"
            label="Admins"
            value={adminsExcludingOwner}
            description="Owner excluded"
            colors={["#0EA5E9", "#0369A1"]}
          />

          <StatCard
            icon="person-circle-outline"
            label="Owner"
            value={ownerCount}
            description="Institution owner"
            colors={["#7C3AED", "#5B21B6"]}
          />

          <StatCard
            icon="people-circle-outline"
            label="Total users"
            value={totalUsers}
            description="All account types"
            colors={["#0891B2", "#155E75"]}
          />
        </View>

        {/* EXPLANATION */}

        <View style={styles.explanationCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.primary}
          />

          <Text style={styles.explanationText}>
            The promoted staff member has both staff and admin roles. They are excluded from “Staff only” but included in “Admins”.
          </Text>
        </View>

        {/* SUBSCRIPTION */}

        {subscription && (
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionIcon}>
              <Ionicons
                name="card-outline"
                size={25}
                color={COLORS.white}
              />
            </View>

            <View style={styles.subscriptionContent}>
              <Text style={styles.subscriptionTitle}>
                {subscription.activePlan ||
                  "Free plan"}
              </Text>

              <Text style={styles.subscriptionStatus}>
                {formatStatus(
                  subscription.status ||
                    "inactive"
                )}
              </Text>

              {Number(
                subscription.amount || 0
              ) > 0 && (
                <Text style={styles.subscriptionAmount}>
                  ₦
                  {Number(
                    subscription.amount
                  ).toLocaleString()}{" "}
                  /{" "}
                  {subscription.billingCycle ||
                    "month"}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() =>
                router.push(
                  "/dashboard/ownerDashboard/subscription"
                )
              }
            >
              <Text style={styles.manageButtonText}>
                Manage
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ATTENDANCE */}

        <SectionHeader
          title="Today's attendance"
          subtitle={`${presentToday} of ${staffOnlyCount} staff present`}
        />

        <View style={styles.attendanceCard}>
          <View style={styles.attendanceHeader}>
            <View>
              <Text style={styles.attendanceTitle}>
                Staff attendance rate
              </Text>

              <Text style={styles.attendanceDescription}>
                Promoted admins are not included in this staff attendance calculation.
              </Text>
            </View>

            <Text style={styles.attendancePercentage}>
              {attendanceRate}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${attendanceRate}%`,
                },
              ]}
            />
          </View>

          <View style={styles.attendanceGrid}>
            <AttendanceItem
              label="Present"
              value={presentToday}
              color={COLORS.success}
            />

            <AttendanceItem
              label="Absent"
              value={absentToday}
              color={COLORS.danger}
            />

            <AttendanceItem
              label="Late"
              value={lateToday}
              color={COLORS.warning}
            />

            <AttendanceItem
              label="On leave"
              value={onLeaveToday}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* WEEKLY TREND */}

        <SectionHeader
          title="Weekly attendance"
          subtitle="Attendance rate by day"
        />

        <View style={styles.weekCard}>
          {weeklyStaffAttendance.length === 0 ? (
            <EmptySection
              icon="trending-up-outline"
              text="No weekly attendance data"
            />
          ) : (
            weeklyStaffAttendance.map(
              (item, index) => (
                <View
                  key={`${item.day}-${index}`}
                  style={styles.weekRow}
                >
                  <Text style={styles.weekDay}>
                    {item.day}
                  </Text>

                  <View style={styles.weekTrack}>
                    <View
                      style={[
                        styles.weekFill,
                        {
                          width: `${Math.min(
                            Math.max(
                              Number(
                                item.attendanceRate ||
                                  0
                              ),
                              0
                            ),
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.weekValue}>
                    {item.attendanceRate || 0}%
                  </Text>
                </View>
              )
            )
          )}
        </View>

        {/* BRANCH OVERVIEW */}

        <SectionHeader
          title="Branch overview"
          subtitle="Staff-only counts by branch"
        />

        <View style={styles.listCard}>
          {branchStaffBreakdown.length === 0 ? (
            <EmptySection
              icon="business-outline"
              text="No branch data available"
            />
          ) : (
            branchStaffBreakdown.map(
              (branch) => (
                <View
                  key={branch.id}
                  style={styles.branchRow}
                >
                  <View style={styles.branchRowIcon}>
                    <Ionicons
                      name="business-outline"
                      size={19}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.branchRowContent}>
                    <Text style={styles.branchRowName}>
                      {branch.name}
                    </Text>

                    <Text style={styles.branchRowAttendance}>
                      Attendance:{" "}
                      {branch.attendance || "0%"}
                    </Text>
                  </View>

                  <View style={styles.branchStaffCount}>
                    <Text style={styles.branchStaffNumber}>
                      {branch.staffCount}
                    </Text>

                    <Text style={styles.branchStaffLabel}>
                      staff
                    </Text>
                  </View>
                </View>
              )
            )
          )}
        </View>

        {/* DEPARTMENTS */}

        {departmentStaffBreakdown.length > 0 && (
          <>
            <SectionHeader
              title="Department overview"
              subtitle="Staff distribution by department"
            />

            <View style={styles.listCard}>
              {departmentStaffBreakdown.map(
                (department) => (
                  <View
                    key={department.id}
                    style={styles.branchRow}
                  >
                    <View style={styles.departmentIcon}>
                      <Ionicons
                        name="grid-outline"
                        size={19}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.branchRowContent}>
                      <Text style={styles.branchRowName}>
                        {department.name}
                      </Text>

                      <Text style={styles.branchRowAttendance}>
                        Attendance:{" "}
                        {department.attendance ||
                          "0%"}
                      </Text>
                    </View>

                    <View style={styles.branchStaffCount}>
                      <Text style={styles.branchStaffNumber}>
                        {department.staffCount}
                      </Text>

                      <Text style={styles.branchStaffLabel}>
                        staff
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          </>
        )}

        {/* RECENT HIRES */}

        <SectionHeader
          title="Recent staff hires"
          subtitle="Latest staff-only accounts"
        />

        <View style={styles.listCard}>
          {recentStaffHires.length === 0 ? (
            <EmptySection
              icon="people-outline"
              text="No recent staff hires"
            />
          ) : (
            recentStaffHires.map((hire) => (
              <View
                key={hire.id}
                style={styles.hireRow}
              >
                <View style={styles.hireAvatar}>
                  <Ionicons
                    name="person"
                    size={19}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.hireContent}>
                  <Text style={styles.hireName}>
                    {hire.name}
                  </Text>

                  <Text style={styles.hireDetails}>
                    Staff ·{" "}
                    {hire.branch ||
                      "No branch"}
                  </Text>
                </View>

                <Text style={styles.hireDate}>
                  {formatDate(hire.date)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNav dashboardType="owner" />
    </View>
  );
}

/* ================= COMPONENTS ================= */


function LoadingState() {
  return (
    <View style={styles.center}>
      <View style={styles.loadingIcon}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.loadingTitle}>
        Loading dashboard
      </Text>

      <Text style={styles.loadingText}>
        Retrieving your institution overview...
      </Text>
    </View>
  );
}

function ErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <View style={styles.center}>
      <View style={styles.errorIcon}>
        <Ionicons
          name="alert-circle-outline"
          size={38}
          color={COLORS.danger}
        />
      </View>

      <Text style={styles.errorTitle}>
        Dashboard unavailable
      </Text>

      <Text style={styles.errorMessage}>
        We could not load your institution dashboard. Check your connection and try again.
      </Text>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Ionicons
          name="refresh-outline"
          size={17}
          color={COLORS.white}
        />

        <Text style={styles.retryText}>
          Try again
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  colors,
}: {
  icon: IconName;
  label: string;
  value: number;
  description: string;
  colors: string[];
}) {
  return (
    <View style={styles.statCard}>
      <LinearGradient
        colors={colors as any}
        style={styles.statGradient}
      >
        <View style={styles.statIcon}>
          <Ionicons
            name={icon}
            size={22}
            color={COLORS.white}
          />
        </View>

        <View>
          <Text style={styles.statValue}>
            {value}
          </Text>

          <Text style={styles.statLabel}>
            {label}
          </Text>

          <Text style={styles.statDescription}>
            {description}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function AttendanceItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.attendanceItem}>
      <View
        style={[
          styles.attendanceDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={styles.attendanceItemLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.attendanceItemValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function EmptySection({
  icon,
  text,
}: {
  icon: IconName;
  text: string;
}) {
  return (
    <View style={styles.emptySection}>
      <Ionicons
        name={icon}
        size={32}
        color={COLORS.subtle}
      />

      <Text style={styles.emptyText}>
        {text}
      </Text>
    </View>
  );
}

/* ================= HELPERS ================= */

function formatStatus(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingBottom: 125,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 13,
  },

  errorText: {
    marginTop: 12,
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "700",
  },

  retryButton: {
    marginTop: 17,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: COLORS.primary,
    borderRadius: 11,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 58,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  institutionBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  institutionIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    backgroundColor: COLORS.blueLight,
    borderRadius: 14,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  institutionName: {
    maxWidth: 210,
    marginTop: 3,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  profileButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: COLORS.blueLight,
    borderRadius: 23,
  },

  greetingBlock: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  greeting: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
  },

  sectionHeader: {
    marginHorizontal: 18,
    marginTop: 23,
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  statCard: {
    width: "48.5%",
    height: 139,
    marginBottom: 10,
    overflow: "hidden",
    borderRadius: 19,
    elevation: 4,
  },

  statGradient: {
    flex: 1,
    justifyContent: "space-between",
    padding: 15,
  },

  statIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },

  statValue: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "900",
  },

  statLabel: {
    marginTop: 1,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  statDescription: {
    marginTop: 3,
    color: "rgba(255,255,255,0.75)",
    fontSize: 9,
  },

  explanationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 18,
    marginTop: 5,
    padding: 12,
    backgroundColor: COLORS.blueLight,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 14,
  },

  explanationText: {
    flex: 1,
    marginLeft: 7,
    color: COLORS.primaryDark,
    fontSize: 10,
    lineHeight: 15,
  },

  subscriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 18,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  subscriptionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
  },

  subscriptionContent: {
    flex: 1,
  },

  subscriptionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  subscriptionStatus: {
    marginTop: 3,
    color: COLORS.success,
    fontSize: 10,
  },

  subscriptionAmount: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.blueLight,
    borderRadius: 10,
  },

  manageButtonText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  attendanceCard: {
    marginHorizontal: 18,
    padding: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
  },

  attendanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  attendanceTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  attendanceDescription: {
    maxWidth: 260,
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  attendancePercentage: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "900",
  },

  progressTrack: {
    height: 10,
    marginTop: 18,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },

  progressFill: {
    height: "100%",
    minWidth: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },

  attendanceGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  attendanceItem: {
    alignItems: "center",
  },

  attendanceDot: {
    width: 8,
    height: 8,
    marginBottom: 5,
    borderRadius: 5,
  },

  attendanceItemLabel: {
    color: COLORS.muted,
    fontSize: 9,
  },

  attendanceItemValue: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "900",
  },

  weekCard: {
    marginHorizontal: 18,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
  },

  weekDay: {
    width: 35,
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "800",
  },

  weekTrack: {
    flex: 1,
    height: 8,
    overflow: "hidden",
    marginHorizontal: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
  },

  weekFill: {
    height: "100%",
    minWidth: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },

  weekValue: {
    width: 38,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
  },

  listCard: {
    marginHorizontal: 18,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  branchRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  branchRowIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: COLORS.blueLight,
    borderRadius: 12,
  },

  center: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 25,
  backgroundColor: COLORS.background,
},

loadingIcon: {
  width: 70,
  height: 70,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.blueLight,
  borderRadius: 23,
},

loadingTitle: {
  marginTop: 16,
  color: COLORS.text,
  fontSize: 17,
  fontWeight: "900",
},

loadingText: {
  marginTop: 6,
  color: COLORS.muted,
  fontSize: 11,
  textAlign: "center",
},

errorIcon: {
  width: 70,
  height: 70,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.dangerLight,
  borderRadius: 23,
},

errorTitle: {
  marginTop: 16,
  color: COLORS.text,
  fontSize: 18,
  fontWeight: "900",
  textAlign: "center",
},

errorMessage: {
  maxWidth: 300,
  marginTop: 7,
  color: COLORS.muted,
  fontSize: 12,
  lineHeight: 18,
  textAlign: "center",
},

  departmentIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
  },

  branchRowContent: {
    flex: 1,
  },

  branchRowName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  branchRowAttendance: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  branchStaffCount: {
    alignItems: "center",
    minWidth: 45,
  },

  branchStaffNumber: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "900",
  },

  branchStaffLabel: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 9,
  },

  hireRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  hireAvatar: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blueLight,
    borderRadius: 20,
  },

  hireContent: {
    flex: 1,
    marginLeft: 10,
  },

  hireName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  hireDetails: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  hireDate: {
    color: COLORS.subtle,
    fontSize: 10,
  },

  emptySection: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },

  emptyText: {
    marginTop: 8,
    color: COLORS.subtle,
    fontSize: 11,
  },

  bottomSpace: {
    height: 20,
  },
});
