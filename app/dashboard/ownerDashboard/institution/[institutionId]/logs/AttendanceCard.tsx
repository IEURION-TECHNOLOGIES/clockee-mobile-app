// AttendanceCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

type DailyLog = {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  scheduledIn: string;
  scheduledOut: string;
  duration: number;
  lateMinutes: number;
  status: "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE" | "REMOTE";
};

type StaffAttendance = {
  id: string;
  name: string;
  staffId: string;
  role: string;
  department?: string;
  branch: string;
  
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  daysOnLeave: number;
  daysRemote: number;
  
  totalScheduledMinutes: number;
  totalWorkedMinutes: number;
  totalLateMinutes: number;
  totalOvertimeMinutes: number;
  totalBreakMinutes: number;
  
  attendanceRate: number;
  punctualityRate: number;
  perfectAttendanceDays: number;
  performanceRating: number;
  grade: "A" | "B" | "C" | "D" | "F";
  
  dailyLogs: DailyLog[];
};

type AttendanceCardProps = {
  staff: StaffAttendance;
};

export default function AttendanceCard({ staff }: AttendanceCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>{staff.name}</Text>
          <Text style={styles.staffId}>{staff.staffId} • {staff.role}</Text>
          <Text style={styles.staffBranch}>{staff.branch} • {staff.department}</Text>
        </View>
        
        <View style={[styles.gradeBadge, styles[`grade${staff.grade}`]]}>
          <Text style={styles.gradeText}>{staff.grade}</Text>
        </View>
      </View>

      {/* ATTENDANCE METRICS */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{staff.attendanceRate}%</Text>
            <Text style={styles.metricLabel}>Attendance</Text>
          </View>
          
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{staff.punctualityRate}%</Text>
            <Text style={styles.metricLabel}>Punctuality</Text>
          </View>
          
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{staff.daysPresent}/{staff.totalWorkingDays}</Text>
            <Text style={styles.metricLabel}>Days Present</Text>
          </View>
          
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{staff.performanceRating}</Text>
            <Text style={styles.metricLabel}>Performance</Text>
          </View>
        </View>

        {/* TIME METRICS */}
        <View style={styles.timeMetrics}>
          <View style={styles.timeMetricRow}>
            <View style={styles.timeMetricItem}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.timeMetricLabel}>Worked:</Text>
              <Text style={styles.timeMetricValue}>{formatDuration(staff.totalWorkedMinutes)}</Text>
            </View>
            
            <View style={styles.timeMetricItem}>
              <Ionicons name="warning-outline" size={14} color="#F59E0B" />
              <Text style={styles.timeMetricLabel}>Late:</Text>
              <Text style={[styles.timeMetricValue, { color: "#F59E0B" }]}>
                {formatDuration(staff.totalLateMinutes)}
              </Text>
            </View>
            
            <View style={styles.timeMetricItem}>
              <Ionicons name="trending-up-outline" size={14} color="#10B981" />
              <Text style={styles.timeMetricLabel}>Overtime:</Text>
              <Text style={[styles.timeMetricValue, { color: "#10B981" }]}>
                {formatDuration(staff.totalOvertimeMinutes)}
              </Text>
            </View>
          </View>
        </View>

        {/* ABSENCE & LATE */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.statLabel}>Absent:</Text>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>
              {staff.daysAbsent} days
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="alert-outline" size={16} color="#F59E0B" />
            <Text style={styles.statLabel}>Late:</Text>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {staff.daysLate} days
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            <Text style={styles.statLabel}>Perfect:</Text>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {staff.perfectAttendanceDays} days
            </Text>
          </View>
        </View>
      </View>

      {/* DAILY LOGS */}
      <View style={styles.logsSection}>
        <Text style={styles.logsTitle}>Daily Logs</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.logsScrollContent}
        >
          {staff.dailyLogs.map((log, index) => (
            <View key={index} style={styles.logCard}>
              <Text style={styles.logDate}>
                {formatLogDateTime(log.date)}
              </Text>
              
              <View style={styles.logTimes}>
                <Text style={styles.logTime}>
                  {formatLogTime(log.clockIn)} -{" "}
                  {formatLogTime(log.clockOut)}
                </Text>
                {log.lateMinutes > 0 && (
                  <Text style={styles.lateBadge}>+{log.lateMinutes}m</Text>
                )}
              </View>
              
              <View style={[styles.statusBadge, styles[`${log.status.toLowerCase()}_badge`]]}>
                <Text style={styles.statusText}>{log.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function formatLogDateTime(
  value?: string | null
) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-US", {
    timeZone: "Africa/Lagos",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLogTime(
  value?: string | null
) {
  if (!value) {
    return "--:--";
  }

  /*
   * If the API already returns a formatted time,
   * such as "08:30 AM", display it directly.
   */
  const looksLikeIsoDate =
    value.includes("T") ||
    value.includes("Z") ||
    /^\d{4}-\d{2}-\d{2}/.test(value);

  if (!looksLikeIsoDate) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("en-US", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  staffId: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
  },

  staffBranch: {
    fontSize: 11,
    color: "#94A3B8",
  },

  gradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  gradeA: {
    backgroundColor: "#DCFCE7",
  },

  gradeB: {
    backgroundColor: "#DBEAFE",
  },

  gradeC: {
    backgroundColor: "#FEF3C7",
  },

  gradeD: {
    backgroundColor: "#FED7AA",
  },

  gradeF: {
    backgroundColor: "#FEE2E2",
  },

  gradeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  metricsContainer: {
    gap: 12,
  },

  metricGrid: {
    flexDirection: "row",
    gap: 8,
  },

  metricBox: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },

  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0284C7",
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },

  timeMetrics: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
  },

  timeMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  timeMetricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  timeMetricLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },

  timeMetricValue: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },

  statValue: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "700",
  },

  logsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  logsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  logsScrollContent: {
    gap: 8,
    paddingRight: 8,
  },

  logCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    width: 140,
    gap: 6,
  },

  logDate: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },

  logTimes: {
    gap: 4,
  },

  logTime: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },

  lateBadge: {
    fontSize: 9,
    color: "#F59E0B",
    fontWeight: "700",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  present_badge: {
    backgroundColor: "#DCFCE7",
  },

  late_badge: {
    backgroundColor: "#FEF3C7",
  },

  absent_badge: {
    backgroundColor: "#FEE2E2",
  },

  on_leave_badge: {
    backgroundColor: "#DBEAFE",
  },

  remote_badge: {
    backgroundColor: "#F3E8FF",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#0F172A",
  },
});
