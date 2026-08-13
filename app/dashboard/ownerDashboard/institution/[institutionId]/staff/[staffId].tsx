import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import UserActionModal from "@/components/UserActionModal";

import {
  allowRemoteClocking,
  promoteToAdmin,
  deactivateUser,
  reactivateUser,
  getSingleUser,
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
  status?: "present" | "absent" | "late" | "holiday" | "weekend" | string;
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

const COLORS = {
  primary: "#0284C7",
  primaryDark: "#0F172A",
  primaryLight: "#38BDF8",
  bg: "#F1F5F9",
  card: "#FFFFFF",
  border: "#E2E8F0",
  textDark: "#0F172A",
  textMuted: "#64748B",
  green: "#22C55E",
  red: "#EF4444",
  amber: "#F59E0B",
  slateBar: "#E2E8F0",
};

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
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusColor(status?: string) {
  switch (status) {
    case "present":
      return COLORS.green;
    case "late":
      return COLORS.amber;
    case "absent":
      return COLORS.red;
    case "holiday":
    case "weekend":
      return COLORS.border;
    default:
      return COLORS.border;
  }
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StaffProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { institutionId, staffId: paramStaffId } = useLocalSearchParams<{
    institutionId?: string;
    staffId?: string;
  }>();

  const [actionVisible, setActionVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // ================= FETCH SINGLE USER =================
  const {
    data: rawData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["staffProfile", paramStaffId],
    queryFn: async () => {
      if (!paramStaffId) throw new Error("Staff ID is required");
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
  const weeklyTrend = staffData?.attendance?.weeklyTrend ?? [];

  // ================= ACTION HANDLER =================
  const runAction = async (fn: Function, extraParams?: any[]) => {
    try {
      setLoadingAction(true);
      const currentStaffId = paramStaffId || staff?._id;
      if (!currentStaffId) throw new Error("User ID not found");

      if (extraParams) {
        await fn(currentStaffId, ...extraParams);
      } else {
        await fn(currentStaffId);
      }

      await queryClient.invalidateQueries({
        queryKey: ["staffProfile", paramStaffId],
      });
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoadingAction(false);
      setActionVisible(false);
    }
  };

  // ================= STATES =================
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (isError || !staff) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.red} />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "600" }}>
          User Not Found
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ================= DERIVED VALUES =================
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    staff.name || "User"
  )}&background=0284C7&color=fff`;

  const isAdmin = Array.isArray(staff.role)
    ? staff.role.some((r: string) => r?.toLowerCase().includes("admin"))
    : typeof staff.role === "string"
    ? staff.role.toLowerCase().includes("admin")
    : false;

  const roleLabel: "admin" | "staff" = isAdmin ? "admin" : "staff";
  const isActive = staff.isActive ?? true;
  const remoteAccess = staff.remoteAccess?.allowed ?? false;

  const branchName = staff.branch?.name || staff.branchId?.name || "N/A";
  const branchAddress = staff.branch?.address || staff.branchId?.address || "N/A";

  // ================= UI =================
  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActionVisible(true)} hitSlop={10}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Text style={styles.name}>{staff.name}</Text>
        <Text style={styles.role}>{roleLabel.toUpperCase()}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.pillBadge}>
            <Ionicons
              name={isActive ? "checkmark-circle" : "close-circle"}
              size={13}
              color={isActive ? COLORS.green : COLORS.red}
            />
            <Text style={styles.pillText}>{isActive ? "ACTIVE" : "INACTIVE"}</Text>
          </View>

          <View style={styles.pillBadge}>
            <Ionicons
              name={remoteAccess ? "wifi" : "wifi-outline"}
              size={13}
              color={remoteAccess ? COLORS.green : COLORS.red}
            />
            <Text style={styles.pillText}>
              {remoteAccess ? "REMOTE ON" : "REMOTE OFF"}
            </Text>
          </View>

          <View style={styles.pillBadge}>
            <Ionicons name="location-outline" size={13} color={COLORS.primaryLight} />
            <Text style={styles.pillText}>
              {(staff.clockMode || "onsite").toUpperCase()}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ===== TODAY'S ATTENDANCE ===== */}
        <SectionCard title="Today's Attendance" icon="time-outline">
          <View style={styles.todayRow}>
            <ClockChip
              label="Clock In"
              time={formatClockTime(todayStatus?.clockInTime ?? null)}
              active={!!todayStatus?.clockedIn}
              lateMinutes={todayStatus?.minutesLate}
              icon="log-in-outline"
            />
            <View style={styles.todayDivider} />
            <ClockChip
              label="Clock Out"
              time={formatClockTime(todayStatus?.clockOutTime ?? null)}
              active={!!todayStatus?.clockedOut}
              icon="log-out-outline"
            />
          </View>

          <View style={styles.workedRow}>
            <Ionicons name="hourglass-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.workedText}>
              Worked today:{" "}
              <Text style={styles.workedValue}>
                {minutesToHrsMins(todayStatus?.totalWorkedToday ?? 0)}
              </Text>
            </Text>
          </View>

          {!todayStatus?.clockedIn && (
            <View style={styles.noticeBox}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.amber} />
              <Text style={styles.noticeText}>
                Not clocked in yet today.
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ===== WEEKLY PERFORMANCE ===== */}
        <SectionCard title="This Week's Performance" icon="stats-chart-outline">
          <View style={styles.weeklyTop}>
            <AttendanceRing rate={weeklyStats?.attendanceRate ?? 0} />

            <View style={styles.kpiGrid}>
              <KpiCell
                label="Present"
                value={weeklyStats?.presentDays ?? 0}
                color={COLORS.green}
              />
              <KpiCell
                label="Absent"
                value={weeklyStats?.absentDays ?? 0}
                color={COLORS.red}
              />
              <KpiCell
                label="Late"
                value={weeklyStats?.lateDays ?? 0}
                color={COLORS.amber}
              />
              <KpiCell
                label="Overtime (hrs)"
                value={weeklyStats?.overtimeHours ?? 0}
                color={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.totalHoursBar}>
            <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.workedText}>
              Total hours this week:{" "}
              <Text style={styles.workedValue}>
                {(weeklyStats?.totalHoursWeek ?? 0).toFixed
                  ? weeklyStats!.totalHoursWeek.toFixed(1)
                  : weeklyStats?.totalHoursWeek ?? 0}
                h
              </Text>
            </Text>
          </View>
        </SectionCard>

        {/* ===== WEEKLY TREND ===== */}
        <SectionCard title="7-Day Trend" icon="calendar-outline">
          <WeeklyTrendChart data={weeklyTrend} />
          <View style={styles.legendRow}>
            <LegendDot color={COLORS.green} label="Present" />
            <LegendDot color={COLORS.amber} label="Late" />
            <LegendDot color={COLORS.red} label="Absent" />
            <LegendDot color={COLORS.border} label="No data" />
          </View>
        </SectionCard>

        {/* ===== STAFF DETAILS ===== */}
        <SectionCard title="Staff Details" icon="person-outline">
          <InfoRow icon="mail-outline" label="Email" value={staff.email} />
          <InfoRow
            icon="business-outline"
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
            value={staff.createdAt ? new Date(staff.createdAt).toDateString() : "N/A"}
            last
          />
        </SectionCard>
      </ScrollView>

      <UserActionModal
        visible={actionVisible}
        role={roleLabel}
        status={isActive ? "active" : "inactive"}
        remoteAccess={remoteAccess}
        loading={loadingAction}
        onClose={() => setActionVisible(false)}
        onPromote={() => runAction(promoteToAdmin)}
        onDeactivate={() => runAction(deactivateUser)}
        onReactivate={() => runAction(reactivateUser)}
        onToggleRemote={() =>
          runAction(allowRemoteClocking, [institutionId!, !remoteAccess])
        }
      />
    </View>
  );
}

/* ================= SECTION CARD ================= */
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/* ================= CLOCK CHIP ================= */
function ClockChip({
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
    <View style={styles.clockChip}>
      <View
        style={[
          styles.clockIconWrap,
          { backgroundColor: active ? "#DCFCE7" : "#F1F5F9" },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={active ? COLORS.green : COLORS.textMuted}
        />
      </View>
      <Text style={styles.clockLabel}>{label}</Text>
      <Text style={styles.clockTime}>{time}</Text>
      {!!lateMinutes && lateMinutes > 0 && (
        <Text style={styles.lateTag}>{lateMinutes}m late</Text>
      )}
    </View>
  );
}

/* ================= KPI CELL ================= */
function KpiCell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.kpiCell}>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

/* ================= ATTENDANCE RING (SVG) ================= */
function AttendanceRing({ rate }: { rate: number }) {
  const size = 100;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, rate));
  const offset = circumference - (clamped / 100) * circumference;

  const ringColor =
    clamped >= 75 ? COLORS.green : clamped >= 40 ? COLORS.amber : COLORS.red;

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.slateBar}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringValue}>{Math.round(clamped)}%</Text>
        <Text style={styles.ringCaption}>Attendance</Text>
      </View>
    </View>
  );
}

/* ================= WEEKLY TREND CHART (SVG) ================= */
function WeeklyTrendChart({ data }: { data: TrendDay[] }) {
  const width = 300;
  const height = 130;
  const paddingX = 12;
  const barAreaHeight = 90;
  const maxHours = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.hoursWorked ?? 0));
    return max;
  }, [data]);

  const days: TrendDay[] =
    data.length === 7
      ? data
      : DAY_LABELS.map((label, i) => data[i] ?? { day: label, status: undefined, hoursWorked: 0 });

  const barWidth = (width - paddingX * 2) / days.length - 10;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Line
        x1={paddingX}
        y1={barAreaHeight + 4}
        x2={width - paddingX}
        y2={barAreaHeight + 4}
        stroke={COLORS.border}
        strokeWidth={1}
      />
      {days.map((d, i) => {
        const hours = d.hoursWorked ?? 0;
        const barH = Math.max(4, (hours / maxHours) * (barAreaHeight - 10));
        const x = paddingX + i * ((width - paddingX * 2) / days.length) + 5;
        const y = barAreaHeight + 4 - barH;
        const color = statusColor(d.status);
        const label = d.day ?? DAY_LABELS[i];

        return (
          <React.Fragment key={`${label}-${i}`}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill={color}
            />
            <SvgText
              x={x + barWidth / 2}
              y={barAreaHeight + 20}
              fontSize="10"
              fill={COLORS.textMuted}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

/* ================= LEGEND DOT ================= */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

/* ================= INFO ROW ================= */
function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: any;
  label: string;
  value?: string | null;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "N/A"}</Text>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },

  hero: {
    paddingTop: 60,
    paddingBottom: 26,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    alignItems: "center",
  },

  header: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: { fontSize: 18, fontWeight: "800", color: "#fff" },
  role: { fontSize: 12, marginTop: 2, color: "#E0F2FE", fontWeight: "600", letterSpacing: 0.5 },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textDark },

  todayRow: { flexDirection: "row", alignItems: "center" },
  todayDivider: { width: 1, height: 60, backgroundColor: COLORS.border, marginHorizontal: 8 },

  clockChip: { flex: 1, alignItems: "center", gap: 4 },
  clockIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  clockLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600" },
  clockTime: { fontSize: 16, fontWeight: "800", color: COLORS.textDark },
  lateTag: {
    fontSize: 10,
    color: COLORS.amber,
    fontWeight: "700",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginTop: 2,
  },

  workedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  workedText: { fontSize: 12, color: COLORS.textMuted },
  workedValue: { color: COLORS.textDark, fontWeight: "700" },

  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "#FFFBEB",
    padding: 8,
    borderRadius: 10,
  },
  noticeText: { fontSize: 11, color: "#92400E", fontWeight: "600" },

  weeklyTop: { flexDirection: "row", alignItems: "center", gap: 16 },

  ringWrap: { width: 100, height: 100, alignItems: "center", justifyContent: "center" },
  ringCenter: { position: "absolute", alignItems: "center" },
  ringValue: { fontSize: 18, fontWeight: "800", color: COLORS.textDark },
  ringCaption: { fontSize: 9, color: COLORS.textMuted, marginTop: 1 },

  kpiGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCell: {
    width: "47%",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  kpiValue: { fontSize: 16, fontWeight: "800" },
  kpiLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600", marginTop: 2, textAlign: "center" },

  totalHoursBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendSwatch: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600" },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: { fontSize: 11, color: COLORS.textMuted },
  infoValue: { fontSize: 14, fontWeight: "600", color: COLORS.textDark, marginTop: 1 },

  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
  },
});
