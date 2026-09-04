import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import Svg, { Circle } from "react-native-svg";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import UserActionModal from "@/components/UserActionModal";
import ManualOverrideModal from "@/components/manualOverideModal";

import {
  allowRemoteClocking,
  promoteToAdmin,
  deactivateUser,
  reactivateUser,
  getSingleUser,
  demoteToStaff,
} from "@/services/superAdminServices";

/* ================= TYPES ================= */
type TodayStatus = {
  clockInStatus: string | null;
  clockInTime: string | null;
  clockOutStatus: string | null;
  clockOutTime: string | null;
  clockedIn: boolean;
  clockedOut: boolean;
  minutesLate: number;
  totalWorkedToday: number; // minutes
};

type WeeklyStats = {
  absentDays: number;
  attendanceRate: number; // 0-100
  lateDays: number;
  overtimeHours: number;
  presentDays: number;
  totalHoursWeek: number;
};

type TrendDay = {
  day?: string;
  date?: string;
  status?:
    | "present"
    | "absent"
    | "late"
    | "holiday"
    | "weekend"
    | string;
  hoursWorked?: number;
};

type StaffData = {
  attendance?: {
    todayStatus?: TodayStatus;
    weeklyStats?: WeeklyStats;
    weeklyTrend?: TrendDay[];
  };
  user?: any;
};

/* ================= THEME ================= */
const C = {
  bg: "#EEF1F6",
  surface: "#FFFFFF",
  surfaceAlt: "#F6F7FB",
  border: "#E5E8EF",
  brand: "#4338CA",
  brandSoft: "#EEF0FF",
  ink: "#0F172A",
  muted: "#64748B",
  faint: "#94A3B8",
  green: "#0F9D58",
  greenSoft: "#E6F5EC",
  red: "#DC2626",
  redSoft: "#FCE9E9",
  amber: "#D97706",
  amberSoft: "#FBF0E1",
  onBrand: "#FFFFFF",
};

const TABS = ["Overview", "Analytics", "Profile"] as const;
type Tab = (typeof TABS)[number];
const DAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];
const WORK_TARGET_MIN = 480; // 8h standard workday

/* ================= HELPERS ================= */
function minutesToHrsMins(mins: number) {
  if (!mins || mins <= 0) return "0h 0m";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

function formatClockTime(iso: string | null) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(status?: string) {
  switch (status) {
    case "present":
      return C.green;
    case "late":
      return C.amber;
    case "absent":
      return C.red;
    default:
      return C.border;
  }
}

function toFixed1(n?: number) {
  const v = Number(n ?? 0);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export default function StaffProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    institutionId,
    staffId: paramStaffId,
  } = useLocalSearchParams<{
    institutionId?: string;
    staffId?: string;
  }>();

  const [actionVisible, setActionVisible] =
    useState(false);

  const [overrideVisible, setOverrideVisible] =
    useState(false);

  const [loadingAction, setLoadingAction] =
    useState(false);

  const [tab, setTab] = useState<Tab>("Overview");

  /* ================= FETCH SINGLE USER ================= */
  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ["staffProfile", paramStaffId],
    queryFn: async () => {
      if (!paramStaffId)
        throw new Error("Staff ID is required");
      const res = await getSingleUser(paramStaffId);
      return res?.data?.data || res?.data;
    },
    enabled: !!paramStaffId,
    staleTime: 0,
  });

  const staffData: StaffData = rawData || {};
  const staff = staffData?.user;
  const todayStatus = staffData?.attendance?.todayStatus;
  const weeklyStats = staffData?.attendance?.weeklyStats;
  const weeklyTrend =
    staffData?.attendance?.weeklyTrend ?? [];

  /* ================= ACTION HANDLER ================= */
  const runAction = async (
    fn: Function,
    extraParams?: any[]
  ) => {
    try {
      setLoadingAction(true);

      const currentStaffId =
        paramStaffId || staff?._id;

      if (!currentStaffId) {
        throw new Error("User ID not found");
      }

      const wrappedFn = async (
        id: string,
        ...args: any[]
      ) => {
        const res = await fn(id, ...args);
        console.log("ACTION RESPONSE:", res);
        return res;
      };

      if (extraParams) {
        await wrappedFn(currentStaffId, ...extraParams);
      } else {
        await wrappedFn(currentStaffId);
      }

      await queryClient.invalidateQueries({
        queryKey: ["staffProfile", paramStaffId],
      });

      setActionVisible(false);
    } catch (err: any) {
      console.error("=== ACTION ERROR ===");
      console.error("Full error:", err);
      console.error(
        "Status:",
        err?.response?.status
      );
      console.error(
        "Data:",
        err?.response?.data
      );
      console.error("Config:", err?.config);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleManualOverrideSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["staffProfile", paramStaffId],
    });
  };

  /* ================= STATES ================= */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={C.brand}
        />
        <Text
          style={{
            marginTop: 12,
            color: C.muted,
            fontWeight: "600",
          }}
        >
          Loading profile…
        </Text>
      </View>
    );
  }

  if (isError || !staff) {
    return (
      <View style={styles.center}>
        <View style={styles.errIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={C.red}
          />
        </View>
        <Text
          style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: "800",
            color: C.ink,
          }}
        >
          User Not Found
        </Text>
        <Text
          style={{
            marginTop: 6,
            color: C.muted,
          }}
        >
          We couldn&apos;t load this staff profile.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={C.onBrand}
          />
          <Text
            style={{
              color: C.onBrand,
              fontWeight: "700",
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ================= DERIVED VALUES ================= */
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    staff.name || "User"
  )}&background=4338CA&color=fff&bold=true`;

  const isAdmin = Array.isArray(staff.role)
    ? staff.role.some((r: string) =>
        r?.toLowerCase().includes("admin")
      )
    : typeof staff.role === "string"
    ? staff.role.toLowerCase().includes("admin")
    : false;

  const roleLabel: "admin" | "staff" = isAdmin
    ? "admin"
    : "staff";

  const isActive = staff.isActive ?? true;
  const remoteAccess =
    staff.remoteAccess?.allowed ?? false;

  const branchName =
    staff.branch?.name ||
    staff.branchId?.name ||
    "N/A";

  const branchAddress =
    staff.branch?.address ||
    staff.branchId?.address ||
    "N/A";

  const branchIdValue =
    typeof staff.branchId === "string"
      ? staff.branchId
      : staff.branchId?._id;

  const workedToday =
    todayStatus?.totalWorkedToday ?? 0;

  const workedPct = Math.min(
    100,
    Math.round((workedToday / WORK_TARGET_MIN) * 100)
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* ===== TOP APP BAR ===== */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.appBarBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={C.ink}
          />
        </TouchableOpacity>

        <Text style={styles.appBarTitle}>
          Admin Profile
        </Text>

        {/* Actions menu (three dots) */}
        <TouchableOpacity
          style={styles.appBarBtn}
          onPress={() => setActionVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={C.ink}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 48,
        }}
      >
        {/* ===== IDENTITY HEADER ===== */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={["#4338CA", "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBanner}
          />

          <View style={styles.headerBody}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
              />

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isActive
                      ? C.green
                      : C.red,
                  },
                ]}
              />
            </View>

            <Text style={styles.name}>
              {staff.name}
            </Text>

            <Text style={styles.subline}>
              {staff.departmentOrUnit ||
                "Staff Member"}
            </Text>

            <View style={styles.tagRow}>
              <Tag
                label={
                  roleLabel === "admin"
                    ? "Administrator"
                    : "Staff"
                }
                color={C.brand}
                bg={C.brandSoft}
                icon={
                  roleLabel === "admin"
                    ? "shield-checkmark"
                    : "person"
                }
              />

              <Tag
                label={
                  isActive ? "Active" : "Inactive"
                }
                color={isActive ? C.green : C.red}
                bg={
                  isActive
                    ? C.greenSoft
                    : C.redSoft
                }
                icon={
                  isActive
                    ? "checkmark-circle"
                    : "close-circle"
                }
              />

              <Tag
                label={
                  remoteAccess
                    ? "Remote On"
                    : "Onsite"
                }
                color={
                  remoteAccess ? C.green : C.muted
                }
                bg={
                  remoteAccess
                    ? C.greenSoft
                    : C.surfaceAlt
                }
                icon={
                  remoteAccess
                    ? "globe-outline"
                    : "business-outline"
                }
              />
            </View>
          </View>
        </View>

        {/* ===== TABS ===== */}
        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = tab === t;

            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tabBtn,
                  active && styles.tabBtnActive,
                ]}
                onPress={() => setTab(t)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    active && styles.tabTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ================= OVERVIEW ================= */}
        {tab === "Overview" && (
          <View style={styles.section}>
            <Card
              title="Today's Attendance"
              icon="today-outline"
            >
              <View style={styles.clockRow}>
                <ClockBlock
                  label="Clock In"
                  time={formatClockTime(
                    todayStatus?.clockInTime ?? null
                  )}
                  active={!!todayStatus?.clockedIn}
                  lateMinutes={
                    todayStatus?.minutesLate
                  }
                  icon="log-in-outline"
                />

                <ClockBlock
                  label="Clock Out"
                  time={formatClockTime(
                    todayStatus?.clockOutTime ?? null
                  )}
                  active={!!todayStatus?.clockedOut}
                  icon="log-out-outline"
                />
              </View>

              <View style={styles.progressWrap}>
                <View style={styles.progressHead}>
                  <Text style={styles.progressLabel}>
                    Hours worked today
                  </Text>

                  <Text style={styles.progressValue}>
                    {minutesToHrsMins(workedToday)}{" "}
                    <Text style={styles.progressTarget}>
                      / 8h
                    </Text>
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.max(
                          3,
                          workedPct
                        )}%`,
                        backgroundColor:
                          workedPct >= 100
                            ? C.green
                            : C.brand,
                      },
                    ]}
                  />
                </View>
              </View>

              {!todayStatus?.clockedIn && (
                <View style={styles.notice}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={C.amber}
                  />

                  <Text style={styles.noticeText}>
                    Not clocked in yet today.
                  </Text>
                </View>
              )}
            </Card>

            <Card
              title="Today's Timeline"
              icon="git-commit-outline"
            >
              <Timeline
                events={[
                  {
                    icon: "log-in-outline",
                    title: "Clocked In",
                    time: formatClockTime(
                      todayStatus?.clockInTime ?? null
                    ),
                    done: !!todayStatus?.clockedIn,
                    color: todayStatus?.minutesLate
                      ? C.amber
                      : C.green,
                    note: todayStatus?.minutesLate
                      ? `${todayStatus.minutesLate}m late`
                      : undefined,
                  },
                  {
                    icon: "hourglass-outline",
                    title: "Working",
                    time: minutesToHrsMins(workedToday),
                    done: !!todayStatus?.clockedIn,
                    color: C.brand,
                  },
                  {
                    icon: "log-out-outline",
                    title: "Clocked Out",
                    time: formatClockTime(
                      todayStatus?.clockOutTime ?? null
                    ),
                    done: !!todayStatus?.clockedOut,
                    color: C.green,
                  },
                ]}
              />
            </Card>

            <View style={styles.statRow}>
              <StatCard
                label="Attendance"
                value={`${Math.round(
                  weeklyStats?.attendanceRate ?? 0
                )}%`}
                caption="this week"
                color={C.green}
                icon="pulse-outline"
              />

              <StatCard
                label="Hours"
                value={`${toFixed1(
                  weeklyStats?.totalHoursWeek
                )}h`}
                caption="this week"
                color={C.brand}
                icon="time-outline"
              />
            </View>
          </View>
        )}

        {/* ================= ANALYTICS ================= */}
        {tab === "Analytics" && (
          <View style={styles.section}>
            <Card
              title="This Week's Performance"
              icon="stats-chart-outline"
            >
              <View style={styles.perfTop}>
                <AttendanceRing
                  rate={
                    weeklyStats?.attendanceRate ?? 0
                  }
                />

                <View style={styles.kpiGrid}>
                  <KpiCell
                    label="Present"
                    value={weeklyStats?.presentDays ?? 0}
                    color={C.green}
                  />

                  <KpiCell
                    label="Absent"
                    value={weeklyStats?.absentDays ?? 0}
                    color={C.red}
                  />

                  <KpiCell
                    label="Late"
                    value={weeklyStats?.lateDays ?? 0}
                    color={C.amber}
                  />

                  <KpiCell
                    label="Overtime"
                    value={
                      weeklyStats?.overtimeHours ?? 0
                    }
                    color={C.brand}
                  />
                </View>
              </View>

              <View style={styles.totalBar}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={C.brand}
                />

                <Text style={styles.totalLabel}>
                  Total hours this week
                </Text>

                <Text style={styles.totalValue}>
                  {toFixed1(
                    weeklyStats?.totalHoursWeek
                  )}
                  h
                </Text>
              </View>
            </Card>

            <Card
              title="7-Day Trend"
              icon="calendar-outline"
            >
              <WeeklyTrendChart data={weeklyTrend} />

              <View style={styles.legendRow}>
                <LegendDot
                  color={C.green}
                  label="Present"
                />

                <LegendDot
                  color={C.amber}
                  label="Late"
                />

                <LegendDot
                  color={C.red}
                  label="Absent"
                />

                <LegendDot
                  color={C.border}
                  label="No data"
                />
              </View>
            </Card>
          </View>
        )}

        {/* ================= PROFILE ================= */}
        {tab === "Profile" && (
          <View style={styles.section}>
            <Card
              title="Staff Details"
              icon="person-outline"
            >
              <InfoRow
                icon="mail-outline"
                label="Email"
                value={staff.email}
              />

              <InfoRow
                icon="briefcase-outline"
                label="Department / Unit"
                value={staff.departmentOrUnit}
              />

              <InfoRow
                icon="card-outline"
                label="Staff ID"
                value={staff.studentOrStaffId}
              />

              <InfoRow
                icon="git-branch-outline"
                label="Branch"
                value={branchName}
              />

              <InfoRow
                icon="location-outline"
                label="Branch Address"
                value={branchAddress}
              />

              <InfoRow
                icon="school-outline"
                label="Institution"
                value={staff.institutionName}
              />

              <InfoRow
                icon="calendar-outline"
                label="Joined"
                value={
                  staff.createdAt
                    ? new Date(
                        staff.createdAt
                      ).toDateString()
                    : "N/A"
                }
                last
              />
            </Card>
          </View>
        )}
      </ScrollView>

      <UserActionModal
        visible={actionVisible}
        role={roleLabel}
        status={isActive ? "active" : "inactive"}
        remoteAccess={remoteAccess}
        loading={loadingAction}
        onClose={() => setActionVisible(false)}
        onDemote={() => runAction(demoteToStaff)}
        onDeactivate={() =>
          runAction(deactivateUser)
        }
        onReactivate={() =>
          runAction(reactivateUser)
        }
        onToggleRemote={() =>
          runAction(allowRemoteClocking, [
            institutionId!,
            !remoteAccess,
          ])
        }
        onManualOverride={() => {
          setActionVisible(false);
          setOverrideVisible(true);
        }}
      />

      <ManualOverrideModal
        visible={overrideVisible}
        userId={staff._id}
        branchId={branchIdValue}
        userName={staff.name}
        onClose={() => setOverrideVisible(false)}
        onSuccess={handleManualOverrideSuccess}
      />
    </View>
  );
}

/* ================= SUB-COMPONENTS ================= */
function Tag({
  label,
  color,
  bg,
  icon,
}: {
  label: string;
  color: string;
  bg: string;
  icon: any;
}) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.tagText, { color }]}>
        {label}
      </Text>
    </View>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons
            name={icon}
            size={16}
            color={C.brand}
          />
        </View>

        <Text style={styles.cardTitle}>
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

function ClockBlock({
  label,
  time,
  active,
  lateMinutes,
  icon,
}: {
  label: string;
  time: string;
  active: boolean;
  lateMinutes?: number;
  icon: any;
}) {
  return (
    <View style={styles.clockBlock}>
      <View style={styles.clockTop}>
        <View
          style={[
            styles.clockIcon,
            {
              backgroundColor: active
                ? C.greenSoft
                : C.surfaceAlt,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={active ? C.green : C.faint}
          />
        </View>

        <Text style={styles.clockLabel}>
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.clockTime,
          { color: active ? C.ink : C.faint },
        ]}
      >
        {time}
      </Text>

      {!!lateMinutes && lateMinutes > 0 && (
        <View style={styles.lateTag}>
          <Text style={styles.lateTagText}>
            {lateMinutes}m late
          </Text>
        </View>
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  caption,
  color,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  color: string;
  icon: any;
}) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statAccent,
          { backgroundColor: color },
        ]}
      />

      <View style={styles.statInner}>
        <View style={styles.statHead}>
          <Ionicons
            name={icon}
            size={16}
            color={color}
          />

          <Text style={styles.statLabel}>
            {label}
          </Text>
        </View>

        <Text style={styles.statValue}>
          {value}
        </Text>

        <Text style={styles.statCaption}>
          {caption}
        </Text>
      </View>
    </View>
  );
}

function KpiCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.kpiCell}>
      <View
        style={[
          styles.kpiBadge,
          { backgroundColor: color },
        ]}
      />

      <View>
        <Text style={styles.kpiValue}>
          {value}
        </Text>

        <Text style={styles.kpiLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function Timeline({
  events,
}: {
  events: {
    icon: any;
    title: string;
    time: string;
    done: boolean;
    color: string;
    note?: string;
  }[];
}) {
  return (
    <View>
      {events.map((e, i) => (
        <View key={i} style={styles.tlRow}>
          <View style={styles.tlLeft}>
            <View
              style={[
                styles.tlDot,
                {
                  backgroundColor: e.done
                    ? e.color
                    : C.surfaceAlt,
                  borderColor: e.done
                    ? e.color
                    : C.border,
                },
              ]}
            >
              <Ionicons
                name={e.icon}
                size={14}
                color={
                  e.done ? C.onBrand : C.faint
                }
              />
            </View>

            {i < events.length - 1 && (
              <View style={styles.tlLine} />
            )}
          </View>

          <View style={styles.tlBody}>
            <Text style={styles.tlTitle}>
              {e.title}
            </Text>

            <View style={styles.tlMetaRow}>
              <Text
                style={[
                  styles.tlTime,
                  { color: e.done ? C.ink : C.faint },
                ]}
              >
                {e.time}
              </Text>

              {e.note && (
                <View style={styles.tlNote}>
                  <Text style={styles.tlNoteText}>
                    {e.note}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function AttendanceRing({ rate }: { rate: number }) {
  const size = 108;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, rate));
  const offset = circ - (pct / 100) * circ;
  const color =
    pct >= 80
      ? C.green
      : pct >= 50
      ? C.amber
      : C.red;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.surfaceAlt}
          strokeWidth={stroke}
          fill="none"
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.ringCenter}>
        <Text
          style={[styles.ringValue, { color }]}
        >
          {Math.round(pct)}%
        </Text>

        <Text style={styles.ringLabel}>
          attendance
        </Text>
      </View>
    </View>
  );
}

function WeeklyTrendChart({ data }: { data: TrendDay[] }) {
  const days: TrendDay[] = DAY_LABELS.map(
    (label, idx) => {
      const found = data[idx] || {};

      return {
        day: found.day || label,
        status: found.status,
        hoursWorked: found.hoursWorked ?? 0,
      };
    }
  );

  const maxHrs = Math.max(
    8,
    ...days.map((d) => d.hoursWorked ?? 0)
  );

  return (
    <View style={styles.chart}>
      {days.map((d, i) => {
        const hrs = d.hoursWorked ?? 0;
        const heightPct = Math.max(
          6,
          (hrs / maxHrs) * 100
        );

        const col = statusColor(d.status);

        return (
          <View key={i} style={styles.chartCol}>
            <Text style={styles.chartValue}>
              {hrs > 0 ? `${toFixed1(hrs)}` : "-"}
            </Text>

            <View style={styles.chartBarTrack}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: `${heightPct}%`,
                    backgroundColor:
                      hrs > 0 ? col : C.border,
                  },
                ]}
              />
            </View>

            <Text style={styles.chartDay}>
              {(d.day || DAY_LABELS[i]).slice(
                0,
                3
              )}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
        ]}
      />

      <Text style={styles.legendText}>
        {label}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: any;
  label: string;
  value?: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && { borderBottomWidth: 0 },
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={16}
          color={C.brand}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value || "N/A"}
        </Text>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
  },

  errIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.redSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    backgroundColor: C.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: C.bg,
  },

  appBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  appBarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: 0.2,
  },

  headerCard: {
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#1E293B",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  headerBanner: {
    height: 78,
    width: "100%",
  },

  headerBody: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 22,
    marginTop: -40,
  },

  avatarWrap: {
    position: "relative",
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: C.surface,
    backgroundColor: C.brandSoft,
  },

  statusDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: C.surface,
  },

  name: {
    fontSize: 21,
    fontWeight: "800",
    color: C.ink,
    marginTop: 12,
  },

  subline: {
    fontSize: 13,
    color: C.muted,
    marginTop: 3,
    fontWeight: "600",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    justifyContent: "center",
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },

  tagText: {
    fontSize: 12,
    fontWeight: "700",
  },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: C.border,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  tabBtnActive: {
    backgroundColor: C.brand,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
  },

  tabTextActive: {
    color: C.onBrand,
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#1E293B",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.ink,
  },

  clockRow: {
    flexDirection: "row",
    gap: 12,
  },

  clockBlock: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  clockTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  clockIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  clockLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },

  clockTime: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
  },

  lateTag: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: C.amberSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  lateTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.amber,
  },

  progressWrap: {
    marginTop: 16,
  },

  progressHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },

  progressValue: {
    fontSize: 13,
    fontWeight: "800",
    color: C.ink,
  },

  progressTarget: {
    fontSize: 12,
    fontWeight: "600",
    color: C.faint,
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: C.surfaceAlt,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    backgroundColor: C.amberSoft,
    padding: 10,
    borderRadius: 10,
  },

  noticeText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.amber,
  },

  statRow: {
    flexDirection: "row",
    gap: 14,
  },

  statCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },

  statAccent: {
    width: 5,
  },

  statInner: {
    flex: 1,
    padding: 14,
  },

  statHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: C.ink,
    marginTop: 8,
  },

  statCaption: {
    fontSize: 11,
    color: C.faint,
    marginTop: 2,
    fontWeight: "600",
  },

  perfTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  kpiGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  kpiCell: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  kpiBadge: {
    width: 4,
    height: 30,
    borderRadius: 999,
  },

  kpiValue: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
  },

  kpiLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },

  ringCenter: {
    position: "absolute",
    alignItems: "center",
  },

  ringValue: {
    fontSize: 22,
    fontWeight: "800",
  },

  ringLabel: {
    fontSize: 10,
    color: C.muted,
    fontWeight: "600",
    marginTop: 1,
  },

  totalBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    backgroundColor: C.surfaceAlt,
    padding: 12,
    borderRadius: 12,
  },

  totalLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },

  totalValue: {
    fontSize: 15,
    fontWeight: "800",
    color: C.brand,
  },

  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 160,
    alignItems: "flex-end",
  },

  chartCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },

  chartValue: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
  },

  chartBarTrack: {
    width: 20,
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: C.surfaceAlt,
    borderRadius: 8,
    overflow: "hidden",
  },

  chartBar: {
    width: "100%",
    borderRadius: 8,
  },

  chartDay: {
    fontSize: 11,
    fontWeight: "700",
    color: C.faint,
  },

  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 16,
    justifyContent: "center",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },

  legendText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },

  tlRow: {
    flexDirection: "row",
    gap: 12,
  },

  tlLeft: {
    alignItems: "center",
    width: 30,
  },

  tlDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  tlLine: {
    width: 2,
    flex: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },

  tlBody: {
    flex: 1,
    paddingBottom: 18,
  },

  tlTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
  },

  tlMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  tlTime: {
    fontSize: 13,
    fontWeight: "600",
  },

  tlNote: {
    backgroundColor: C.amberSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },

  tlNoteText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.amber,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.faint,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
    marginTop: 2,
  },
});


