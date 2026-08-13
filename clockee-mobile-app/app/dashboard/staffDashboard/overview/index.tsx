// ======================= StaffOverview =======================

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import BottomNav from "../../../../components/BottomNav";
import { useStaffOverview } from "@/hooks/useStaffOverview";
import { useProfile } from "@/hooks/useProfile";
import logo from "../../../../assets/images/splash/clockee_logo.png";

const screenWidth = Dimensions.get("window").width;
const PRIMARY = "#0EA5E9";

export default function StaffOverview() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useStaffOverview();


const {
      data: profile,
      error,
    } = useProfile();


     // 🔥 Do NOT block screen
  const safeProfile = profile || {};

  const role =
    safeProfile?.role?.[0]?.replace("_", " ") || "User";

    
  // 🔥 NEVER block UI
  const schedule = data?.schedule || {};
  const history = data?.history || [];
  const summaryData = data?.summaryData || {};
  const todayStatus = summaryData?.todayStatus || {};
  const summary = summaryData?.summary || {};

  /* ========================= WEEK HELPERS ========================= */

  const startOfWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  const endOfWeek = useMemo(() => {
    const sunday = new Date(startOfWeek);
    sunday.setDate(startOfWeek.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }, [startOfWeek]);

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    const diff =
      new Date(clockOut).getTime() -
      new Date(clockIn).getTime();
    if (diff <= 0) return 0;
    return diff / (1000 * 60 * 60);
  };

  /* ========================= WEEKLY CALCULATIONS ========================= */

  const weeklyTotal = useMemo(() => {
    let total = 0;

    history.forEach((record) => {
      if (!record.clockIn?.time || !record.clockOut?.time) return;

      const date = new Date(record.clockIn.time);
      if (date < startOfWeek || date > endOfWeek) return;

      total += calculateHours(
        record.clockIn.time,
        record.clockOut.time
      );
    });

    return total.toFixed(2);
  }, [history]);

  const overtime = useMemo(() => {
    if (!schedule?.expectedStartTime || !schedule?.expectedEndTime)
      return 0;

    const [sh, sm] = schedule.expectedStartTime.split(":").map(Number);
    const [eh, em] = schedule.expectedEndTime.split(":").map(Number);

    const expected =
      (eh * 60 + em - (sh * 60 + sm)) / 60;

    let extra = 0;

    history.forEach((record) => {
      if (!record.clockIn?.time || !record.clockOut?.time) return;

      const date = new Date(record.clockIn.time);
      if (date < startOfWeek || date > endOfWeek) return;

      const worked = calculateHours(
        record.clockIn.time,
        record.clockOut.time
      );

      if (worked > expected) extra += worked - expected;
    });

    return extra.toFixed(2);
  }, [history, schedule]);

  const weeklyTrend = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map = Object.fromEntries(days.map(d => [d, 0]));

    history.forEach((record) => {
      if (!record.clockIn?.time || !record.clockOut?.time) return;

      const date = new Date(record.clockIn.time);
      if (date < startOfWeek || date > endOfWeek) return;

      const day = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (map[day] !== undefined) {
        map[day] += calculateHours(
          record.clockIn.time,
          record.clockOut.time
        );
      }
    });

    return days.map((d) => ({
      day: d,
      hours: +map[d].toFixed(2),
    }));
  }, [history]);

  const daysPresent = useMemo(() => {
  const uniqueDays = new Set();

  history.forEach((record) => {
    if (!record.clockIn?.time) return;

    const date = new Date(record.clockIn.time);

    if (date < startOfWeek || date > endOfWeek) return;

    const dayKey = date.toDateString(); // unique day
    uniqueDays.add(dayKey);
  });

  return uniqueDays.size;
}, [history, startOfWeek, endOfWeek]);

  const chartData = {
    labels: weeklyTrend.map((d) => d.day),
    datasets: [
      { data: weeklyTrend.map((d) => d.hours) },
    ],
  };

  /* ========================= STATUS ========================= */

  const getTodayStatus = () => {
    if (!todayStatus?.clockedIn)
      return { text: "Not clocked in", color: "#EF4444" };

    if (todayStatus?.clockedIn && !todayStatus?.clockedOut)
      return { text: "Currently working", color: PRIMARY };

    if (todayStatus?.clockedOut)
      return { text: "Shift completed", color: "#16A34A" };

    return { text: "-", color: "#64748B" };
  };

  const status = getTodayStatus();

  const handleTodayPress = () => {
    if (!todayStatus?.clockedIn) {
      router.push("/dashboard/staffDashboard/clockIn/clockIn");
    } else {
      router.push("/dashboard/staffDashboard/clockIn/success");
    }
  };

  /* ========================= UI ========================= */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
          />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.header}>
           {isLoading && (
              <ActivityIndicator
                size="small"
                color="#0EA5E9"
                style={{ marginBottom: 10 }}
              />
            )}
          <View>
            <Text style={styles.greeting}>
              Welcome back 👋
            </Text>
            <Text style={styles.sub}>
              Here’s your work summary
            </Text>
          </View>

          <TouchableOpacity
            style={styles.userBox}
            onPress={() =>
              router.push("/dashboard/staffDashboard/profile")
            }
          >
            <Text style={styles.name}>
              {safeProfile?.name || "Loading..."}
            </Text>

            <Image
              source={
                safeProfile?.avatar &&
                safeProfile.avatar.startsWith("http")
                  ? { uri: safeProfile.avatar }
                  : logo
              }
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

         {/* ERROR (Non Blocking) */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                Failed to load profile. Pull to refresh.
              </Text>
            </View>
          )}

        {/* STATUS */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Today</Text>
          <Text
            style={[
              styles.statusText,
              { color: status.color },
            ]}
          >
            {status.text}
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: status.color },
            ]}
            onPress={handleTodayPress}
          >
            <Text style={styles.primaryText}>
              {!todayStatus?.clockedIn
                ? "Clock In"
                : "Go to Shift"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <StatBox
            label="Days Present"
            value={daysPresent}
          />
          <StatBox
            label="Times Late"
            value={summary?.lateDays ?? 0}
          />
          <StatBox
            label="Overtime (hrs)"
            value={overtime}
          />
        </View>

        {/* WEEKLY TOTAL */}
        <View style={styles.card}>
          <Text style={styles.title}>
            Total Work Time (This Week)
          </Text>
          <Text style={styles.big}>
            {weeklyTotal} hrs
          </Text>
        </View>

        {/* CHART */}
        <View style={styles.card}>
          <Text style={styles.title}>
            Weekly Work Trend
          </Text>

          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={200}
            yAxisSuffix="h"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 1,
              color: (opacity = 1) =>
                `rgba(14,165,233,${opacity})`,
              labelColor: () => "#64748B",
            }}
            bezier
            style={{ marginTop: 10, borderRadius: 16 }}
          />
        </View>
      </ScrollView>

      <BottomNav dashboardType="staff" />
    </SafeAreaView>
  );
}

const StatBox = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  content: { paddingHorizontal: 20, paddingBottom: 90 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: { fontSize: 18, fontWeight: "700" },
  sub: { color: "#64748B", fontSize: 12 },
  userBox: { flexDirection: "row", alignItems: "center" },
  name: { fontWeight: "700", marginRight: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  statusCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  statusTitle: { fontWeight: "700", marginBottom: 6 },
  statusText: { fontSize: 14, marginBottom: 12 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  title: { fontWeight: "700", marginBottom: 10 },
  big: { fontSize: 26, fontWeight: "700" },
  primaryBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
    errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  errorText: {
    color: "#991B1B",
    fontSize: 13,
  },
});
