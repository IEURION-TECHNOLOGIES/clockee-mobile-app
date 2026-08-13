// ======================= StaffOverview.tsx =======================

import React from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import BottomNav from "../../../../components/BottomNav";
import { useAuth } from "../../../../context/AuthContext";
import { useStaffOverview } from "@/hooks/useStaffOverview";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#0284C7",
  primaryDark: "#0369A1",
  primaryLight: "#E0F2FE",
  success: "#047857",
  successLight: "#ECFDF5",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  purple: "#7C3AED",
};

type IconName = keyof typeof Ionicons.glyphMap;

type StaffProfile = {
  name: string;
  firstName?: string;
  jobTitle?: string | null;
  roles?: string[];
};

type Schedule = {
  name: string;
  workDays: string[];
  expectedStartTime: string;
  expectedEndTime: string;
  breakDurationMinutes: number;
  gracePeriodMinutes: number;
};

type TodayData = {
  date: string;
  isScheduledWorkDay: boolean;
  status: string;
  clockedIn: boolean;
  clockedOut: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  workedMinutes: number;
  workedHours: number;
  isLate: boolean;
  lateMinutes: number;
  isOvertime: boolean;
  overtimeMinutes: number;
};

type Summary = {
  totalWorkedMinutes: number;
  totalWorkedHours: number;
  expectedMinutes: number;
  expectedHours: number;
  remainingMinutes: number;
  remainingHours: number;
  overtimeMinutes: number;
  overtimeHours: number;
};

type WeeklyTrendItem = {
  date: string;
  day: string;
  scheduled: boolean;
  status: string;
  workedMinutes: number;
  workedHours: number;
  expectedMinutes: number;
};

type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  clockIn: {
    time: string;
  } | null;
  clockOut: {
    time: string;
  } | null;
  isLate: boolean;
  lateMinutes: number;
};

type LeaveSummary = {
  usedDays: number;
  remainingDays: number;
  pendingRequests: number;
};

type StaffOverviewData = {
  staff: StaffProfile;
  schedule: Schedule;
  today: TodayData;
  summary: Summary;
  weeklyTrend: WeeklyTrendItem[];
  attendanceRecords: AttendanceRecord[];
  leaveSummary: LeaveSummary;
};

/* ================= SCREEN ================= */

export default function StaffOverview() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useStaffOverview();

  const data =
    rawData as StaffOverviewData | undefined;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Loading your overview...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data?.staff) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={COLORS.danger}
            />
          </View>

          <Text style={styles.errorTitle}>
            Overview unavailable
          </Text>

          <Text style={styles.errorMessage}>
            {error?.message ||
              "We could not load your attendance overview."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const {
    staff,
    schedule,
    today,
    summary,
    weeklyTrend,
    attendanceRecords,
    leaveSummary,
  } = data;

  const firstName =
    staff.firstName ||
    staff.name?.split(" ")[0] ||
    user?.name?.split(" ")[0] ||
    "there";

  const todayView = getTodayView(today);

  /*
   * This calculation is about work hours:
   *
   * Worked hours / Expected hours * 100
   *
   * It does not use scheduled days.
   */
  const workCompletionPercentage =
    summary.expectedHours > 0
      ? Math.min(
          Math.max(
            (summary.totalWorkedHours /
              summary.expectedHours) *
              100,
            0
          ),
          100
        )
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.identity}>
              <View style={styles.personIcon}>
                <Ionicons
                  name="person"
                  size={25}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.identityText}>
                <Text style={styles.eyebrow}>
                  STAFF OVERVIEW
                </Text>

                <Text style={styles.userName}>
                  {firstName}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.notificationButton}
              onPress={() =>
                router.push(
                  "/dashboard/staffDashboard/notifications"
                )
              }
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          {/* TODAY */}

          <SectionTitle
            title="Today"
            subtitle={formatDate(today.date)}
          />

          <View
            style={[
              styles.todayCard,
              {
                borderColor: todayView.color,
              },
            ]}
          >
            <View style={styles.todayTopRow}>
              <View style={styles.todayTextBox}>
                <Text style={styles.todayLabel}>
                  ATTENDANCE STATUS
                </Text>

                <Text
                  style={[
                    styles.todayStatus,
                    {
                      color: todayView.color,
                    },
                  ]}
                >
                  {todayView.label}
                </Text>

                <Text style={styles.todayDescription}>
                  {todayView.description}
                </Text>
              </View>

              <View
                style={[
                  styles.todayIcon,
                  {
                    backgroundColor:
                      todayView.background,
                  },
                ]}
              >
                <Ionicons
                  name={todayView.icon}
                  size={29}
                  color={todayView.color}
                />
              </View>
            </View>

            <View style={styles.todayDetails}>
              <TimeDetail
                label="Clock in"
                value={formatTime(today.clockInTime)}
                icon="log-in-outline"
              />

              <TimeDetail
                label="Clock out"
                value={formatTime(today.clockOutTime)}
                icon="log-out-outline"
              />

              <TimeDetail
                label="Worked"
                value={`${today.workedHours || 0}h`}
                icon="time-outline"
              />

              <TimeDetail
                label="Late by"
                value={
                  today.isLate
                    ? `${today.lateMinutes} min`
                    : "On time"
                }
                icon="alert-circle-outline"
              />
            </View>

            <Pressable
              style={[
                styles.todayButton,
                {
                  backgroundColor:
                    todayView.color,
                },
              ]}
              onPress={() => {
                if (!today.clockedIn) {
                  router.push(
                    "/dashboard/staffDashboard/clockIn/clockIn"
                  );
                } else {
                  router.push(
                    "/dashboard/staffDashboard/clockIn/success"
                  );
                }
              }}
            >
              <Text style={styles.todayButtonText}>
                {!today.clockedIn
                  ? "Clock in"
                  : "View today's shift"}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color={COLORS.white}
              />
            </Pressable>
          </View>

          {/* WEEKLY SUMMARY */}

          <SectionTitle
            title="This week"
            subtitle="Your attendance summary"
          />

          <View style={styles.metricsGrid}>
            <MetricCard
              label="Worked hours"
              value={`${summary.totalWorkedHours}h`}
              icon="time-outline"
              color={COLORS.success}
              background={COLORS.successLight}
            />

            <MetricCard
              label="Expected hours"
              value={`${summary.expectedHours}h`}
              icon="flag-outline"
              color={COLORS.primary}
              background={COLORS.primaryLight}
            />

            <MetricCard
              label="Remaining"
              value={`${summary.remainingHours}h`}
              icon="hourglass-outline"
              color={COLORS.warning}
              background={COLORS.warningLight}
            />

            <MetricCard
              label="Overtime"
              value={`${summary.overtimeHours}h`}
              icon="trending-up-outline"
              color={COLORS.purple}
              background="#F3E8FF"
            />
          </View>

          {/* CLEAR WORK HOURS CARD */}

          <View style={styles.hoursCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>
                  Weekly work completion
                </Text>

                <Text style={styles.cardSubtitle}>
                  Actual worked hours compared with expected hours
                </Text>
              </View>

              <View style={styles.cardIcon}>
                <Ionicons
                  name="bar-chart-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.hoursSummary}>
              <View>
                <Text style={styles.hoursSummaryLabel}>
                  Worked
                </Text>

                <Text
                  style={[
                    styles.hoursSummaryValue,
                    {
                      color: COLORS.success,
                    },
                  ]}
                >
                  {summary.totalWorkedHours}h
                </Text>
              </View>

              <Text style={styles.hoursDivider}>
                /
              </Text>

              <View>
                <Text style={styles.hoursSummaryLabel}>
                  Expected
                </Text>

                <Text
                  style={[
                    styles.hoursSummaryValue,
                    {
                      color: COLORS.primary,
                    },
                  ]}
                >
                  {summary.expectedHours}h
                </Text>
              </View>

              <View style={styles.percentageBox}>
                <Text style={styles.percentageValue}>
                  {Math.round(
                    workCompletionPercentage
                  )}%
                </Text>

                <Text style={styles.percentageLabel}>
                  completed
                </Text>
              </View>
            </View>

            <View style={styles.hoursTrack}>
              <View
                style={[
                  styles.hoursFill,
                  {
                    width: `${workCompletionPercentage}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.hoursLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor:
                        COLORS.success,
                    },
                  ]}
                />

                <Text style={styles.legendText}>
                  Worked: {summary.totalWorkedHours}h
                </Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor:
                        COLORS.border,
                    },
                  ]}
                />

                <Text style={styles.legendText}>
                  Remaining: {summary.remainingHours}h
                </Text>
              </View>
            </View>

            <View style={styles.explanationBox}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={COLORS.primary}
              />

              <Text style={styles.explanationText}>
                This bar compares the hours you have worked with the total hours expected for this period. It is not based on scheduled days.
              </Text>
            </View>
          </View>

          {/* SCHEDULE */}

          <SectionTitle
            title="Work schedule"
            subtitle={schedule.name}
          />

          <View style={styles.scheduleCard}>
            <ScheduleRow
              icon="time-outline"
              label="Working hours"
              value={`${schedule.expectedStartTime} - ${schedule.expectedEndTime}`}
            />

            <ScheduleRow
              icon="calendar-outline"
              label="Work days"
              value={schedule.workDays
                .map((day) => day.toUpperCase())
                .join(" · ")}
            />

            <ScheduleRow
              icon="cafe-outline"
              label="Break"
              value={`${schedule.breakDurationMinutes} minutes`}
            />

            <ScheduleRow
              icon="timer-outline"
              label="Grace period"
              value={`${schedule.gracePeriodMinutes} minutes`}
              last
            />
          </View>

          {/* WEEKLY ATTENDANCE */}

          <SectionTitle
            title="Weekly attendance"
            subtitle="Your daily attendance status"
          />

          <View style={styles.weekCard}>
            {weeklyTrend.map((item) => (
              <WeekDayRow
                key={item.date}
                item={item}
              />
            ))}
          </View>

          {/* RECENT RECORDS */}

          <View style={styles.sectionHeaderWithAction}>
            <View>
              <Text style={styles.sectionTitle}>
                Recent attendance
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your latest attendance records
              </Text>
            </View>

            <Pressable
              style={styles.viewAllButton}
              onPress={() =>
                router.push(
                  "/dashboard/staffDashboard/clockIn/history"
                )
              }
            >
              <Text style={styles.viewAllText}>
                View all
              </Text>

              <Ionicons
                name="arrow-forward"
                size={15}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          <View style={styles.recordsCard}>
            {attendanceRecords.length > 0 ? (
              attendanceRecords
                .slice(0, 5)
                .map((record) => (
                  <AttendanceRecordRow
                    key={record.id}
                    record={record}
                  />
                ))
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="No attendance records"
                description="Your records will appear here."
              />
            )}
          </View>

          {/* LEAVE */}

          <SectionTitle
            title="Leave balance"
            subtitle="Your current leave information"
          />

          <View style={styles.leaveCard}>
            <LeaveItem
              label="Available"
              value={`${leaveSummary.remainingDays} days`}
              color={COLORS.success}
            />

            <LeaveItem
              label="Used"
              value={`${leaveSummary.usedDays} days`}
              color={COLORS.warning}
            />

            <LeaveItem
              label="Pending"
              value={`${leaveSummary.pendingRequests}`}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <BottomNav dashboardType="staff" />
      </View>
    </SafeAreaView>
  );
}

/* ================= COMPONENTS ================= */

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

function TimeDetail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: IconName;
}) {
  return (
    <View style={styles.timeDetail}>
      <Ionicons
        name={icon}
        size={16}
        color={COLORS.muted}
      />

      <Text style={styles.timeLabel}>
        {label}
      </Text>

      <Text style={styles.timeValue}>
        {value}
      </Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  background,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text
        style={[
          styles.metricValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

function ScheduleRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.scheduleRow,
        !last && styles.rowBorder,
      ]}
    >
      <View style={styles.scheduleIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.scheduleLabel}>
        {label}
      </Text>

      <Text style={styles.scheduleValue}>
        {value}
      </Text>
    </View>
  );
}

function WeekDayRow({
  item,
}: {
  item: WeeklyTrendItem;
}) {
  const isFuture = isFutureDate(item.date);
  const isWeekend =
    item.day === "Sat" ||
    item.day === "Sun";

  let status = item.status;

  if (isWeekend || !item.scheduled) {
    status = "off";
  } else if (isFuture) {
    status = "upcoming";
  }

  const color = getAttendanceColor(status);

  let detail = "Non-working day";

  if (status === "upcoming") {
    detail = "Scheduled work day";
  } else if (item.scheduled) {
    detail = `${item.workedHours || 0}h worked`;
  }

  return (
    <View style={styles.weekDayRow}>
      <View
        style={[
          styles.weekDayCircle,
          {
            backgroundColor:
              status === "off"
                ? "#F1F5F9"
                : COLORS.primaryLight,
          },
        ]}
      >
        <Text
          style={[
            styles.weekDayText,
            {
              color:
                status === "off"
                  ? COLORS.muted
                  : COLORS.primaryDark,
            },
          ]}
        >
          {item.day}
        </Text>
      </View>

      <View style={styles.weekDayContent}>
        <Text style={styles.weekDayDate}>
          {formatShortDate(item.date)}
        </Text>

        <Text style={styles.weekDayHours}>
          {detail}
        </Text>
      </View>

      <View
        style={[
          styles.weekStatusBadge,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Text
          style={[
            styles.weekStatusText,
            {
              color,
            },
          ]}
        >
          {formatStatus(status)}
        </Text>
      </View>
    </View>
  );
}

function AttendanceRecordRow({
  record,
}: {
  record: AttendanceRecord;
}) {
  const color =
    getAttendanceColor(record.status);

  return (
    <View style={styles.recordRow}>
      <View
        style={[
          styles.recordIcon,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={17}
          color={color}
        />
      </View>

      <View style={styles.recordContent}>
        <Text style={styles.recordDate}>
          {formatDate(record.date)}
        </Text>

        <Text style={styles.recordTime}>
          {formatTime(record.clockIn?.time)} -{" "}
          {formatTime(record.clockOut?.time)}
        </Text>
      </View>

      <View style={styles.recordRight}>
        <Text
          style={[
            styles.recordStatus,
            {
              color,
            },
          ]}
        >
          {formatStatus(record.status)}
        </Text>

        {record.isLate && (
          <Text style={styles.recordLate}>
            {record.lateMinutes}m late
          </Text>
        )}
      </View>
    </View>
  );
}

function LeaveItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.leaveItem}>
      <Text
        style={[
          styles.leaveValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.leaveLabel}>
        {label}
      </Text>
    </View>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={icon}
        size={32}
        color={COLORS.subtle}
      />

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

function isFutureDate(dateString: string) {
  const today = new Date();

  const date = new Date(dateString);

  const todayKey = [
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ].join("-");

  const dateKey = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join("-");

  return dateKey > todayKey;
}

function getTodayView(today: TodayData) {
  if (!today.isScheduledWorkDay) {
    return {
      label: "Day off",
      description:
        "You are not scheduled to work today.",
      color: COLORS.muted,
      background: "#F1F5F9",
      icon: "moon-outline" as const,
    };
  }

  if (today.status === "absent") {
    return {
      label: "Absent",
      description:
        "No attendance record has been recorded.",
      color: COLORS.danger,
      background: COLORS.dangerLight,
      icon: "close-circle-outline" as const,
    };
  }

  if (today.status === "onLeave") {
    return {
      label: "On leave",
      description:
        "You are marked as being on leave.",
      color: COLORS.purple,
      background: "#F3E8FF",
      icon: "calendar-outline" as const,
    };
  }

  if (today.isLate) {
    return {
      label: "Present · Late",
      description: `You clocked in ${today.lateMinutes} minutes late.`,
      color: COLORS.warning,
      background: COLORS.warningLight,
      icon: "time-outline" as const,
    };
  }

  if (
    today.clockedIn &&
    !today.clockedOut
  ) {
    return {
      label: "Currently working",
      description:
        "Your shift is currently active.",
      color: COLORS.primary,
      background: COLORS.primaryLight,
      icon: "pulse-outline" as const,
    };
  }

  if (
    today.clockedIn &&
    today.clockedOut
  ) {
    return {
      label: "Shift completed",
      description:
        "You have completed today's shift.",
      color: COLORS.success,
      background: COLORS.successLight,
      icon: "checkmark-circle-outline" as const,
    };
  }

  return {
    label: formatStatus(today.status),
    description:
      "Today's attendance status.",
    color: COLORS.primary,
    background: COLORS.primaryLight,
    icon: "information-circle-outline" as const,
  };
}

function getAttendanceColor(status: string) {
  const normalized = status
    .toLowerCase()
    .replace(/[-_]/g, "");

  if (normalized.includes("late")) {
    return COLORS.warning;
  }

  if (normalized.includes("present")) {
    return COLORS.success;
  }

  if (normalized.includes("absent")) {
    return COLORS.danger;
  }

  if (normalized.includes("remote")) {
    return COLORS.purple;
  }

  if (normalized.includes("leave")) {
    return "#2563EB";
  }

  if (normalized.includes("upcoming")) {
    return COLORS.muted;
  }

  if (normalized.includes("off")) {
    return COLORS.subtle;
  }

  return COLORS.primary;
}

function formatStatus(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 120,
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

  errorIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerLight,
    borderRadius: 20,
  },

  errorTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  errorMessage: {
    maxWidth: 290,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 21,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
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
    paddingTop: 16,
    paddingBottom: 20,
  },

  identity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  personIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: "#BAE6FD",
    borderRadius: 25.5,
  },

  identityText: {
    marginLeft: 11,
  },

  eyebrow: {
    color: COLORS.primaryDark,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  userName: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },

  notificationButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  sectionTitleRow: {
    marginTop: 21,
    marginBottom: 10,
  },

  sectionHeaderWithAction: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 23,
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  viewAllText: {
    marginRight: 4,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  todayCard: {
    padding: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderRadius: 21,
  },

  todayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  todayTextBox: {
    flex: 1,
  },

  todayLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  todayStatus: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
  },

  todayDescription: {
    maxWidth: 240,
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  todayIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderRadius: 29,
  },

  todayDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  timeDetail: {
    width: "50%",
    minHeight: 52,
    paddingVertical: 5,
  },

  timeLabel: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
  },

  timeValue: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
    paddingVertical: 12,
    borderRadius: 12,
  },

  todayButtonText: {
    marginRight: 7,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  metricCard: {
    width: "48.5%",
    minHeight: 116,
    padding: 14,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
  },

  metricIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  metricValue: {
    marginTop: 9,
    fontSize: 21,
    fontWeight: "900",
  },

  metricLabel: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  hoursCard: {
    marginTop: 5,
    padding: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  cardSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  cardIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 13,
  },

  hoursSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  hoursSummaryLabel: {
    color: COLORS.muted,
    fontSize: 9,
  },

  hoursSummaryValue: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: "900",
  },

  hoursDivider: {
    marginHorizontal: 12,
    color: COLORS.subtle,
    fontSize: 22,
  },

  percentageBox: {
    flex: 1,
    alignItems: "flex-end",
  },

  percentageValue: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },

  percentageLabel: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 9,
  },

  hoursTrack: {
    height: 11,
    marginTop: 20,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },

  hoursFill: {
    height: "100%",
    minWidth: 3,
    backgroundColor: COLORS.success,
    borderRadius: 10,
  },

  hoursLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    marginRight: 5,
    borderRadius: 5,
  },

  legendText: {
    color: COLORS.muted,
    fontSize: 9,
  },

  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 15,
    padding: 10,
    backgroundColor: "#F0F9FF",
    borderRadius: 11,
  },

  explanationText: {
    flex: 1,
    marginLeft: 7,
    color: COLORS.primaryDark,
    fontSize: 9,
    lineHeight: 14,
  },

  scheduleCard: {
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 59,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  scheduleIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
  },

  scheduleLabel: {
    flex: 1,
    marginLeft: 9,
    color: COLORS.muted,
    fontSize: 11,
  },

  scheduleValue: {
    maxWidth: 170,
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
  },

  weekCard: {
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  weekDayRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 65,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  weekDayCircle: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  weekDayText: {
    fontSize: 10,
    fontWeight: "900",
  },

  weekDayContent: {
    flex: 1,
    marginLeft: 10,
  },

  weekDayDate: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  weekDayHours: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  weekStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  weekStatusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  recordsCard: {
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  recordIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  recordContent: {
    flex: 1,
    marginLeft: 9,
  },

  recordDate: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  recordTime: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  recordRight: {
    alignItems: "flex-end",
  },

  recordStatus: {
    fontSize: 10,
    fontWeight: "900",
  },

  recordLate: {
    marginTop: 3,
    color: COLORS.warning,
    fontSize: 9,
  },

  leaveCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  leaveItem: {
    alignItems: "center",
  },

  leaveValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  leaveLabel: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
  },

  emptyTitle: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  emptyDescription: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  bottomSpace: {
    height: 20,
  },
});
