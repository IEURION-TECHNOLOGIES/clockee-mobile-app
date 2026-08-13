// app/dashboard/adminDashboard/overview/Overview.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useBranchOverview } from "@/hooks/useAdminDashboard";
import type {
  BranchAdminDepartment,
  BranchAdminStaff,
  BranchAdminWeeklyTrend,
} from "@/services/superAdminServices";

/* ================= COLORS ================= */

const PRIMARY = "#0093DD";
const PRIMARY_LIGHT = "#32AFE7";
const PRIMARY_SOFT = "#EAF8FE";
const PRIMARY_BORDER = "#B8E7F8";
function hasAdminRole(member: any) {
  const roles = [
    ...(Array.isArray(member?.role)
      ? member.role
      : member?.role
        ? [member.role]
        : []),

    ...(Array.isArray(member?.roles)
      ? member.roles
      : []),
  ].map((role: string) =>
    role.toLowerCase().trim()
  );

  return (
    roles.includes("admin") ||
    roles.includes("super_admin") ||
    roles.includes("owner")
  );
}

/* ================= SCREEN ================= */

export default function Overview() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    initialized: authInitialized,
  } = useAuth();

  /*
   * This is the important part.
   *
   * Your login response contains:
   *
   * user.branchId =
   * "6a7344c4bb04105459f3dc2a"
   */
  const branchId =
    user?.branchId || null;

  const institutionId = user?.institutionId || null;

  console.log(
    "[Overview] Authenticated user:",
    {
      userId: user?.id,
      name: user?.name,
      branchId: user?.branchId,
      finalBranchId: branchId,
      role: user?.role,
      roles: user?.roles,
      dashboardType:
        user?.dashboardType,
    }
  );

  const {
    data: overview,
    isLoading: dashboardLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useBranchOverview(branchId);

  useEffect(() => {
    console.log(
      "[Overview] Dashboard state:",
      {
        branchId,
        authLoading,
        authInitialized,
        dashboardLoading,
        isFetching,
        isError,
        hasOverview: Boolean(overview),
        errorMessage: error?.message,
      }
    );
  }, [
    branchId,
    authLoading,
    authInitialized,
    dashboardLoading,
    isFetching,
    isError,
    overview,
    error,
  ]);

  if (authLoading || !authInitialized) {
    return (
      <LoadingState message="Loading account..." />
    );
  }

  if (!user) {
    console.error(
      "[Overview] No authenticated user found"
    );

    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="person-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Account unavailable
        </Text>

        <Text style={styles.errorMessage}>
          Please log in again to continue.
        </Text>
      </View>
    );
  }

  if (!branchId) {
    console.error(
      "[Overview] Authenticated user has no branchId:",
      {
        userId: user.id,
        user,
      }
    );

    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="business-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          No branch assigned
        </Text>

        <Text style={styles.errorMessage}>
          This admin account does not have a branch assigned.
        </Text>

        <Text style={styles.debugText}>
          User ID: {user.id}
        </Text>
      </View>
    );
  }

  if (dashboardLoading) {
    return (
      <LoadingState
        message="Loading branch overview..."
        branchId={branchId}
      />
    );
  }

  if (isError || !overview) {
    const apiError = error as any;

    console.error(
      "[Overview] Dashboard request failed:",
      {
        branchId,
        message: error?.message,
        status:
          apiError?.response?.status,
        responseData:
          apiError?.response?.data,
        requestUrl:
          apiError?.config?.url,
      }
    );

    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Overview unavailable
        </Text>

        <Text style={styles.errorMessage}>
          {error?.message ||
            "We could not load the branch overview data."}
        </Text>

        <Text style={styles.debugText}>
          Branch ID: {branchId}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => {
            console.log(
              "[Overview] Retrying dashboard:",
              branchId
            );

            refetch();
          }}
        >
          <Text style={styles.retryButtonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  const {
  branch,
  admin,
  todaySummary,
  staff = [],
  departments = [],
  weeklyTrend = [],
} = overview;

/*
 * Admins are excluded even when their roles are:
 *
 * ["staff", "admin"]
 */
const staffOnly = staff.filter((member) => {
  const isCurrentUser =
    member._id === user.id;

  const isAdmin =
    hasAdminRole(member);

  const shouldExclude =
    isCurrentUser || isAdmin;

  console.log(
    "[Overview] Staff filtering:",
    {
      id: member._id,
      name: member.name,
      role: (member as any).role,
      roles: (member as any).roles,
      isCurrentUser,
      isAdmin,
      included: !shouldExclude,
    }
  );

  return !shouldExclude;
});

const staffPresent = staffOnly.filter(
  (member) =>
    member.todayAttendance?.status ===
    "present"
).length;

const staffLate = staffOnly.filter(
  (member) =>
    member.todayAttendance?.status ===
    "late"
).length;

const staffAbsent = staffOnly.filter(
  (member) =>
    member.todayAttendance?.status ===
    "absent"
).length;

const staffRemote = staffOnly.filter(
  (member) =>
    member.todayAttendance?.status ===
    "remote"
).length;

const staffOnLeave = staffOnly.filter(
  (member) =>
    member.todayAttendance?.status ===
    "onLeave"
).length;

const staffExcused = staffOnly.filter(
  (member) =>
    member.todayAttendance?.status ===
    "excused"
).length;

const staffNotRecorded = staffOnly.filter(
  (member) =>
    !member.todayAttendance?.status ||
    member.todayAttendance.status ===
      "notRecorded"
).length;

const staffAttended =
  staffPresent +
  staffLate +
  staffRemote +
  staffExcused;

const staffAttendanceRate =
  staffOnly.length > 0
    ? Math.round(
        (staffAttended /
          staffOnly.length) *
          100
      )
    : 0;

console.log(
  "[Overview] Staff-only totals:",
  {
    totalStaff: staffOnly.length,
    present: staffPresent,
    late: staffLate,
    absent: staffAbsent,
    remote: staffRemote,
    onLeave: staffOnLeave,
    excused: staffExcused,
    notRecorded: staffNotRecorded,
    attended: staffAttended,
    attendanceRate:
      staffAttendanceRate,
  }
);


  const branchIsActive =
    branch.status?.toLowerCase() ===
    "active";

  console.log(
    "[Overview] Rendering dashboard:",
    {
      branchId,
      responseBranchId: branch._id,
      branchName: branch.name,
      adminName: admin.name,
      staffCount: staff.length,
      departmentCount: departments.length,
      weeklyTrendCount: weeklyTrend.length,
      attendanceRate:
        todaySummary.attendanceRate,
    }
  );

  return (
    <View style={styles.screen}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.branchHeaderSide}>
            <View style={styles.branchIcon}>
              <Ionicons
                name="business-outline"
                size={22}
                color={PRIMARY}
              />
            </View>

            <View style={styles.branchHeaderText}>
              <Text style={styles.headerEyebrow}>
                MY BRANCH
              </Text>

              <Text
                style={styles.branchName}
                numberOfLines={1}
              >
                {branch.name}
              </Text>

              <Text
                style={styles.branchAddress}
                numberOfLines={1}
              >
                {branch.address ||
                  "No address added"}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.adminHeaderSide}
            onPress={() => {
              router.push(
                "/dashboard/adminDashboard/profile"
              );
            }}
          >
            <View style={styles.adminHeaderText}>
              <Text
                style={styles.adminName}
                numberOfLines={1}
              >
                {admin.name}
              </Text>

              <Text style={styles.adminRole}>
                Branch admin
              </Text>
            </View>

            {admin.avatar &&
              admin.avatar.startsWith("http") ? (
                <Image
                  source={{
                    uri: admin.avatar,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={30}
                    color="#64748B"
                  />
                </View>
              )}
          </Pressable>
        </View>

        <View style={styles.headerBottomRow}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                branchIsActive
                  ? styles.statusDotActive
                  : styles.statusDotDisabled,
              ]}
            />

            <Text style={styles.statusPillText}>
              {branchIsActive
                ? "Branch active"
                : "Branch disabled"}
            </Text>
          </View>

          {isFetching ? (
            <ActivityIndicator
              size="small"
              color={PRIMARY}
            />
          ) : (
            <Pressable
              style={styles.notificationButton}
              onPress={() => {
                console.log(
                  "[Overview] Notifications pressed"
                );
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={PRIMARY}
              />

              <View
                style={styles.notificationDot}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.pageTitleRow}>
          <View>
            <Text style={styles.pageTitle}>
              Today at a glance
            </Text>

            <Text style={styles.pageSubtitle}>
              {formatDate(todaySummary.date)}
            </Text>
          </View>

          <View style={styles.todayBadge}>
            <View style={styles.todayBadgeDot} />

            <Text style={styles.todayBadgeText}>
              TODAY
            </Text>
          </View>
        </View>

        {/* ATTENDANCE CARD */}

        <View style={styles.attendanceCard}>
          <View style={styles.attendanceTop}>
            <View>
              <Text style={styles.attendanceLabel}>
                Attendance rate
              </Text>

              <Text style={styles.attendanceValue}>
                {staffAttendanceRate}%
              </Text>

              <Text style={styles.attendanceHint}>
                {staffAttended} of{" "}
                {staffOnly.length} staff attended
              </Text>
            </View>

            <View style={styles.attendanceIcon}>
              <Ionicons
                name="pulse-outline"
                size={28}
                color={PRIMARY}
              />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${clamp(
                    staffAttendanceRate
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={styles.attendanceFooter}>
            <Text style={styles.attendanceFooterText}>
              {staffPresent} on-time
            </Text>

            <Text style={styles.attendanceFooterText}>
              {staffLate} late
            </Text>

            <Text style={styles.attendanceFooterText}>
              {staffAbsent} absent
            </Text>
          </View>
        </View>

        {/* KPI GRID */}

        <View style={styles.kpiGrid}>
          <KpiCard
            title="Total staff"
            value={staffOnly.length}
            icon="people-outline"
            color={PRIMARY}
            background={PRIMARY_SOFT}
          />

          <KpiCard
            title="On-time"
            value={staffPresent}
            icon="checkmark-circle-outline"
            color="#047857"
            background="#ECFDF5"
          />

          <KpiCard
            title="Late"
            value={staffLate}
            icon="time-outline"
            color="#B45309"
            background="#FFFBEB"
          />

          <KpiCard
            title="Absent"
            value={staffAbsent}
            icon="close-circle-outline"
            color="#B91C1C"
            background="#FEF2F2"
          />
        </View>
        {/* OTHER STATUSES */}

        <SectionHeader
          title="Other attendance statuses"
          subtitle="Additional attendance information for today."
          icon="layers-outline"
          color={PRIMARY}
          background={PRIMARY_SOFT}
        />

        <View style={styles.card}>
          <StatusRow
            label="Remote"
            description="Working away from the branch"
            value={staffRemote}
            icon="laptop-outline"
            color="#7C3AED"
            background="#F5F3FF"
          />

          <StatusRow
            label="On leave"
            description="Approved leave or time off"
            value={staffOnLeave}
            icon="calendar-outline"
            color="#2563EB"
            background="#EFF6FF"
          />

          <StatusRow
            label="Excused"
            description="Attendance was excused"
            value={staffExcused}
            icon="shield-checkmark-outline"
            color={PRIMARY}
            background={PRIMARY_SOFT}
          />

          <StatusRow
            label="Not recorded"
            description="No attendance status recorded"
            value={staffNotRecorded}
            icon="help-circle-outline"
            color="#64748B"
            background="#F1F5F9"
            last
          />
        </View>

        {/* STAFF */}

        <SectionHeader
          title="Staff activity"
          subtitle="Attendance status for your branch staff."
          icon="people-outline"
          color={PRIMARY}
          background={PRIMARY_SOFT}
          actionLabel="View all"
          onAction={() => {
            router.push({
              pathname:
                "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/staffList",
              params: {
                branchId,
                institutionId,
              },
            });
          }}
        />

        <View style={styles.card}>
         {staffOnly.length > 0 ? (
          staffOnly
            .slice(0, 6)
            .map((member) => (
              <StaffRow
                key={member._id}
                staff={member}
              />
            ))
        ) : (
            <EmptyState
              icon="people-outline"
              title="No staff members"
              description="Staff assigned to this branch will appear here."
            />
          )}
        </View>

        {/* DEPARTMENTS */}

        <SectionHeader
          title="Departments"
          subtitle="Attendance by department or unit."
          icon="grid-outline"
          color={PRIMARY}
          background={PRIMARY_SOFT}
        />

        <View style={styles.card}>
  {departments.length > 0 ? (
    departments.map(
      (
        department: BranchAdminDepartment,
        index: number
      ) => {
        const departmentStaff =
          staffOnly.filter(
            (member) =>
              member.departmentOrUnit
                ?.toLowerCase()
                .trim() ===
              department.name
                .toLowerCase()
                .trim()
          );

        return (
          <DepartmentRow
            key={department.name}
            department={department}
            staff={departmentStaff}
            last={
              index === departments.length - 1
            }
          />
        );
      }
    )
  ) : (
    <EmptyState
      icon="folder-open-outline"
      title="No departments"
      description="Department information will appear here."
    />
  )}
</View>

        {/* WEEKLY TREND */}

        <SectionHeader
          title="Weekly attendance trend"
          subtitle="Attendance performance for the current week."
          icon="bar-chart-outline"
          color={PRIMARY}
          background={PRIMARY_SOFT}
        />

        <View style={styles.chartCard}>
          {weeklyTrend.length > 0 ? (
            <View style={styles.chartContainer}>
              {weeklyTrend.map(
                (
                  item: BranchAdminWeeklyTrend
                ) => (
                  <ChartBar
                    key={item.date}
                    day={item.day}
                    value={item.attendanceRate}
                  />
                )
              )}
            </View>
          ) : (
            <EmptyState
              icon="bar-chart-outline"
              title="No trend data"
              description="Weekly attendance data will appear here."
            />
          )}
        </View>

        {/* QUICK ACTIONS */}

        {/* <SectionHeader
          title="Quick actions"
          subtitle="Common branch management actions."
          icon="flash-outline"
          color={PRIMARY}
          background={PRIMARY_SOFT}
        /> */}

        {/* <View style={styles.quickActions}>
          <QuickAction
            label="Add staff"
            icon="person-add-outline"
            onPress={() =>
              router.push({
                pathname:
                  "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/create",
                params: {
                  branchId,
                  institutionId,
                },
              })
            }
          />

          <QuickAction
            label="Staff list"
            icon="people-outline"
            onPress={() =>
              router.push({
                pathname:
                  "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/staffList",
                params: {
                  branchId,
                  institutionId,
                },
              })
            }
          />

          <QuickAction
            label="Attendance"
            icon="calendar-outline"
            onPress={() =>
              router.push({
                pathname:
                  "/dashboard/adminDashboard/institution/[institutionId]/[branchId]/logs",
                params: {
                  branchId,
                  institutionId,
                },
              })
            }
          />

          <QuickAction
            label="Settings"
            icon="settings-outline"
            onPress={() => {
              console.log(
                "[Overview] Settings pressed:",
                branchId
              );
            }}
          />
        </View> */}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNav dashboardType="admin" />
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
      <ActivityIndicator
        size="large"
        color={PRIMARY}
      />

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

/* ================= KPI CARD ================= */

function KpiCard({
  title,
  value,
  icon,
  color,
  background,
}: {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View
        style={[
          styles.kpiIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text style={styles.kpiValue}>
        {value}
      </Text>

      <Text style={styles.kpiTitle}>
        {title}
      </Text>
    </View>
  );
}

/* ================= SECTION HEADER ================= */

function SectionHeader({
  title,
  subtitle,
  icon,
  color,
  background,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <View style={styles.sectionText}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>

      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={styles.actionText}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ================= STATUS ROW ================= */

function StatusRow({
  label,
  description,
  value,
  icon,
  color,
  background,
  last = false,
}: {
  label: string;
  description: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.statusRow,
        !last && styles.rowBorder,
      ]}
    >
      <View
        style={[
          styles.statusIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <View style={styles.statusTextContainer}>
        <Text style={styles.statusLabel}>
          {label}
        </Text>

        <Text style={styles.statusDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.statusValue}>
        {value}
      </Text>
    </View>
  );
}

/* ================= STAFF ROW ================= */

function StaffRow({
  staff,
}: {
  staff: BranchAdminStaff;
}) {

  const attendance =
    staff.todayAttendance;

  const status =
    attendance?.status || "notRecorded";

  return (
    <View style={styles.staffRow}>

      <View style={styles.staffContent}>
        <Text
          style={styles.staffName}
          numberOfLines={1}
        >
          {staff.name}
        </Text>

        <Text
          style={styles.staffDepartment}
          numberOfLines={1}
        >
          {staff.departmentOrUnit ||
            "No department"}
        </Text>

        <Text style={styles.staffTime}>
          {getAttendanceTime(attendance)}
        </Text>
      </View>

      <View
        style={[
          styles.staffStatusBadge,
          {
            backgroundColor:
              getStatusBackground(status),
          },
        ]}
      >
        <Text
          style={[
            styles.staffStatusText,
            {
              color: getStatusColor(status),
            },
          ]}
        >
          {formatStatus(status)}
        </Text>
      </View>
    </View>
  );
}

/* ================= DEPARTMENT ROW ================= */

function DepartmentRow({
  department,
  staff,
  last,
}: {
  department: BranchAdminDepartment;
  staff: BranchAdminStaff[];
  last: boolean;
}) {
  const departmentPresent =
    staff.filter(
      (member) =>
        member.todayAttendance?.status ===
        "present"
    ).length;

  const departmentLate =
    staff.filter(
      (member) =>
        member.todayAttendance?.status ===
        "late"
    ).length;

  const departmentAbsent =
    staff.filter(
      (member) =>
        member.todayAttendance?.status ===
        "absent"
    ).length;

  const departmentRemote =
    staff.filter(
      (member) =>
        member.todayAttendance?.status ===
        "remote"
    ).length;

  const departmentOnLeave =
    staff.filter(
      (member) =>
        member.todayAttendance?.status ===
        "onLeave"
    ).length;

  const departmentExcused =
    staff.filter(
      (member) =>
        member.todayAttendance?.status ===
        "excused"
    ).length;

  const departmentAttended =
    departmentPresent +
    departmentLate +
    departmentRemote +
    departmentExcused;

  const attendanceRate =
    staff.length > 0
      ? Math.round(
          (departmentAttended /
            staff.length) *
            100
        )
      : 0;

  console.log(
    "[Overview] Department staff-only totals:",
    {
      department: department.name,
      totalStaff: staff.length,
      present: departmentPresent,
      late: departmentLate,
      absent: departmentAbsent,
      remote: departmentRemote,
      onLeave: departmentOnLeave,
      excused: departmentExcused,
      attendanceRate,
    }
  );

  return (
    <View
      style={[
        styles.departmentRow,
        !last && styles.rowBorder,
      ]}
    >
      <View style={styles.departmentTopRow}>
        <View>
          <Text style={styles.departmentName}>
            {department.name}
          </Text>

          <Text
            style={styles.departmentStaffCount}
          >
            {staff.length} staff
          </Text>
        </View>

        <Text style={styles.departmentRate}>
          {attendanceRate}%
        </Text>
      </View>

      <View
        style={styles.departmentProgressTrack}
      >
        <View
          style={[
            styles.departmentProgressFill,
            {
              width: `${clamp(
                attendanceRate
              )}%`,
            },
          ]}
        />
      </View>

      <View style={styles.departmentStats}>
        <Text
          style={styles.departmentStatPresent}
        >
          {departmentPresent} present
        </Text>

        <Text
          style={styles.departmentStatLate}
        >
          {departmentLate} late
        </Text>

        <Text
          style={styles.departmentStatAbsent}
        >
          {departmentAbsent} absent
        </Text>
      </View>
    </View>
  );
}

/* ================= CHART ================= */

function ChartBar({
  day,
  value,
}: {
  day: string;
  value: number;
}) {
  const safeValue = clamp(value);

  return (
    <View style={styles.chartBarWrapper}>
      <Text style={styles.chartValue}>
        {safeValue}%
      </Text>

      <View style={styles.chartTrack}>
        <View
          style={[
            styles.chartBar,
            {
              height: `${Math.max(
                safeValue,
                4
              )}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.chartDay}>
        {day}
      </Text>
    </View>
  );
}

/* ================= QUICK ACTION ================= */

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.quickAction}
      onPress={onPress}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={PRIMARY}
        />
      </View>

      <Text style={styles.quickActionText}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ================= EMPTY STATE ================= */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={icon}
          size={28}
          color="#94A3B8"
        />
      </View>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptyDescription}>
        {description}
      </Text>
    </View>
  );
}

/* ================= HELPERS ================= */

function clamp(value?: number) {
  return Math.min(
    Math.max(Number(value) || 0, 0),
    100
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Today";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getAttendanceTime(
  attendance:
    | BranchAdminStaff["todayAttendance"]
    | null
    | undefined
) {
  if (!attendance) {
    return "No attendance recorded";
  }

  if (attendance.status === "absent") {
    return "No check-in";
  }

  if (attendance.status === "onLeave") {
    return "Approved leave";
  }

  if (!attendance.checkInTime) {
    return "No check-in time";
  }

  const checkIn = new Date(
    attendance.checkInTime
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!attendance.checkOutTime) {
    return `Checked in ${checkIn}`;
  }

  const checkOut = new Date(
    attendance.checkOutTime
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${checkIn} - ${checkOut}`;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "present":
      return "#047857";

    case "late":
      return "#B45309";

    case "remote":
      return "#7C3AED";

    case "onleave":
    case "on_leave":
      return "#2563EB";

    case "absent":
      return "#B91C1C";

    default:
      return "#64748B";
  }
}

function getStatusBackground(status: string) {
  switch (status.toLowerCase()) {
    case "present":
      return "#ECFDF5";

    case "late":
      return "#FFFBEB";

    case "remote":
      return "#F5F3FF";

    case "onleave":
    case "on_leave":
      return "#EFF6FF";

    case "absent":
      return "#FEF2F2";

    default:
      return "#F1F5F9";
  }
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
  },

  errorIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 18,
  },

  errorTitle: {
    marginTop: 14,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  errorMessage: {
    maxWidth: 290,
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  debugText: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: PRIMARY,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 18,
    paddingBottom: 19,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarPlaceholder: {
  width: 60,
  height: 60,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#E2E8F0",
  borderWidth: 2,
  borderColor: "#BAE6FD",
  borderRadius: 30,
},

  branchHeaderSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  branchIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 15,
  },

  branchHeaderText: {
    flex: 1,
    marginLeft: 10,
  },

  headerEyebrow: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  branchName: {
    marginTop: 4,
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },

  branchAddress: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  adminHeaderSide: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  adminHeaderText: {
    alignItems: "flex-end",
    marginRight: 8,
  },

  adminName: {
    maxWidth: 100,
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "900",
  },

  adminRole: {
    marginTop: 3,
    color: PRIMARY,
    fontSize: 9,
    fontWeight: "800",
  },

  adminAvatar: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderColor: PRIMARY_LIGHT,
    borderRadius: 21,
  },

  headerBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 10,
  },

  statusDot: {
    width: 7,
    height: 7,
    marginRight: 6,
    borderRadius: 5,
  },

  statusDotActive: {
    backgroundColor: "#10B981",
  },

  statusDotDisabled: {
    backgroundColor: "#F97316",
  },

  statusPillText: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: "800",
  },

  notificationButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 13,
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    backgroundColor: "#F97316",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 5,
  },

  scrollContent: {
    paddingBottom: 125,
  },

  pageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 21,
  },

  pageTitle: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "900",
  },

  pageSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
  },

  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 10,
  },

  todayBadgeDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },

  todayBadgeText: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: "900",
  },

  attendanceCard: {
    marginHorizontal: 18,
    marginTop: 16,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: 21,
    elevation: 3,
  },

  attendanceTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  attendanceLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },

  attendanceValue: {
    marginTop: 4,
    color: PRIMARY,
    fontSize: 36,
    fontWeight: "900",
  },

  attendanceHint: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 10,
  },

  attendanceIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 29,
  },

  progressTrack: {
    height: 9,
    marginTop: 19,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },

  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 10,
  },

  attendanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },

  attendanceFooterText: {
    color: "#64748B",
    fontSize: 10,
  },

  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 14,
  },

  kpiCard: {
    width: "48%",
    minHeight: 127,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 17,
    elevation: 3,
  },

  kpiIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 12,
  },

  kpiValue: {
    color: "#0F172A",
    fontSize: 25,
    fontWeight: "900",
  },

  kpiTitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 11,
  },

  sectionIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },

  sectionText: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
  },

  actionText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "800",
  },

  card: {
    marginHorizontal: 18,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 19,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 66,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  statusIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  statusTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  statusLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  statusDescription: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  statusValue: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  staffAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  staffContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  staffName: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },

  staffDepartment: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  staffTime: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 9,
  },

  staffStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  staffStatusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  departmentRow: {
    paddingVertical: 14,
  },

  departmentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  departmentName: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  departmentStaffCount: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  departmentRate: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "900",
  },

  departmentProgressTrack: {
    height: 7,
    marginTop: 9,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
  },

  departmentProgressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 8,
  },

  departmentStats: {
    flexDirection: "row",
    marginTop: 7,
  },

  departmentStatPresent: {
    marginRight: 10,
    color: "#047857",
    fontSize: 9,
    fontWeight: "700",
  },

  departmentStatLate: {
    marginRight: 10,
    color: "#B45309",
    fontSize: 9,
    fontWeight: "700",
  },

  departmentStatAbsent: {
    color: "#B91C1C",
    fontSize: 9,
    fontWeight: "700",
  },

  chartCard: {
    minHeight: 190,
    marginHorizontal: 18,
    padding: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 19,
  },

  chartContainer: {
    height: 155,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  chartBarWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    minWidth: 32,
  },

  chartValue: {
    marginBottom: 5,
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
  },

  chartTrack: {
    width: 22,
    height: 105,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },

  chartBar: {
    width: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 8,
  },

  chartDay: {
    marginTop: 7,
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
  },

  quickAction: {
    width: "23%",
    minHeight: 91,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
  },

  quickActionIcon: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 11,
  },

  quickActionText: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 145,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
  },

  emptyTitle: {
    marginTop: 9,
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyDescription: {
    maxWidth: 260,
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },

  bottomSpace: {
    height: 20,
  },
});
