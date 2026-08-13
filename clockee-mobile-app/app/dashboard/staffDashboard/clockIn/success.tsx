// ======================= StaffShift.js =======================
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import logo from "../../../../assets/images/splash/clockee_logo.png";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import ResponseModal from "@/components/ResponseModal";
import BottomNav from "../../../../components/BottomNav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import {
  clockOut,
  getSchedule,
  getClockHistory,
  getClockSummary,
} from "../../../../services/clockServices";

const OFFLINE_KEY = "offline_clockins";

export default function StaffShift() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [clockingOut, setClockingOut] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const autoClockedOut = useRef(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // ================= FETCH =================
  const fetchAll = async () => {
    try {
      const summaryRes = await getClockSummary();
      const historyRes = await getClockHistory();
      const scheduleRes = await getSchedule();

      setTodayStatus(summaryRes?.data?.data?.todayStatus || null);
      setHistory(historyRes?.data?.data || []);
      setSchedule(scheduleRes?.data?.data?.schedule || null);
    } catch (err) {
      console.log(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);


  const formatMinutesToHours = (minutes = 0) => {
  if (!minutes || minutes <= 0) return "0 min";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs > 0 && mins > 0) return `${hrs}hr ${mins}min`;
  if (hrs > 0) return `${hrs}hr`;
  return `${mins}min`;
};


  // ================= EXPECTED WORK SECONDS FROM SCHEDULE =================
const getExpectedSecondsFromSchedule = () => {
  if (!schedule?.expectedStartTime || !schedule?.expectedEndTime)
    return 8 * 3600; // fallback 8 hrs

  const [startH, startM] = schedule.expectedStartTime
    .split(":")
    .map(Number);

  const [endH, endM] = schedule.expectedEndTime
    .split(":")
    .map(Number);

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  let diffMinutes = endTotal - startTotal;

  // Handle overnight shifts (example: 10PM - 6AM)
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  return diffMinutes * 60;
};

  // ================= LIVE TIMER =================
useEffect(() => {
  if (!todayStatus?.clockedIn || todayStatus?.clockedOut) {
    setLiveSeconds(
      Math.floor(Number(todayStatus?.totalWorkedToday || 0))
    );
    return;
  }

  const clockInTime = new Date(todayStatus.clockInTime).getTime();

  const updateTimer = () => {
    const now = new Date();

    // ✅ worked time (from clock-in)
    const diff = Math.floor((now.getTime() - clockInTime) / 1000);
    setLiveSeconds(diff);

    // ✅ calculate today's scheduled END time
    if (schedule?.expectedEndTime) {
      const [endH, endM] = schedule.expectedEndTime
        .split(":")
        .map(Number);

      const endTime = new Date();
      endTime.setHours(endH, endM, 0, 0);

      const remaining = Math.floor(
        (endTime.getTime() - now.getTime()) / 1000
      );

      setTimeLeft(remaining > 0 ? remaining : 0);

      // Optional auto clock out
      if (
        remaining <= 0 &&
        !autoClockedOut.current &&
        !todayStatus?.clockedOut
      ) {
        autoClockedOut.current = true;
        handleClockOut(true);
      }
    }
  };

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
}, [todayStatus, schedule]);


  // ================= CLOCK OUT =================
  // ================= CLOCK OUT =================
const handleClockOut = async (isAuto = false) => {
  if (todayStatus?.clockedOut || clockingOut) return;

  try {
    setClockingOut(true);

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      if (!isAuto) alert("Location permission required");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const lat = +location.coords.latitude.toFixed(6);
    const lng = +location.coords.longitude.toFixed(6);

    const net = await NetInfo.fetch();

    // ================= ONLINE =================
    if (net.isConnected) {
      console.log("🚀 ONLINE CLOCK OUT");

      await clockOut(lat, lng);
      await fetchAll();

      if (isAuto) {
        alert("Shift ended. Automatically clocked out.");
      }
    } 

    // ================= OFFLINE =================
    else {
      console.log("📦 OFFLINE CLOCK OUT");

      await saveOfflineClockOut(lat, lng);

      alert("Clock-out saved offline. Will sync automatically when online.");
    }

  } catch (err) {
    if (!isAuto)
      alert(err?.response?.data?.message || "Clock out failed");
  } finally {
    setClockingOut(false);
  }
};

// ================= SAVE OFFLINE CLOCK OUT =================
const saveOfflineClockOut = async (lat, lng) => {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_KEY);
    let data = existing ? JSON.parse(existing) : { offlineLogs: [] };
    if (!data.offlineLogs) data.offlineLogs = [];

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const sequence = String(data.offlineLogs.length + 1).padStart(3, "0");

    const offlinePayload = {
      syncId: `clockout-${user?.id || "unknown"}-${dateStr}-${sequence}`,
      actionType: "clock-out",
      timestamp: now.toISOString(),
      offlineCreatedAt: now.toISOString(),
      branchId: user?.branchId || user?.institutionId,
      gps: {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      },
      deviceInfo: `${Platform.OS} ${Platform.Version || ""}`,
      mode: "offline",
    };

    data.offlineLogs.push(offlinePayload);

    await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(data));

    console.log("✅ Offline clock-out saved →", offlinePayload.syncId);

  } catch (err) {
    console.error("❌ Failed to save offline clock-out:", err);
  }
};

const getExpectedDurationText = () => {
  if (!schedule?.expectedStartTime || !schedule?.expectedEndTime)
    return "8hr 0min"; // fallback

  const [startH, startM] = schedule.expectedStartTime
    .split(":")
    .map(Number);

  const [endH, endM] = schedule.expectedEndTime
    .split(":")
    .map(Number);

  let startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;

  let diffMinutes = endTotal - startTotal;

  // handle overnight shifts
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  return formatMinutesToHours(diffMinutes);
};

  // ================= HELPERS =================
  const formatSeconds = (secs = 0) => {
    const total = Math.floor(Number(secs));
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formatTime = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getHistoryColor = (status) => {
    if (status === "on-time") return "#16A34A";
    if (status === "early") return "#22C55E";
    if (status === "late") return "#F59E0B";
    if (status === "very-late") return "#DC2626";
    return "#94A3B8";
  };

  const getStatusText = () => {
  if (!todayStatus?.clockedIn) return "Not Clocked In";

  const minutes = todayStatus?.minutesLate || 0;
  const formatted = formatMinutesToHours(minutes);

  if (todayStatus.clockInStatus === "very-late") {
    return `🚨 Late by ${formatted}`;
  }

  if (todayStatus.clockInStatus === "late") {
    return `Late by ${formatted}`;
  }

  if (todayStatus.clockInStatus === "early") {
    return "Early";
  }

  return "On Time";
};

const formatStatusText = (status) => {
  if (!status) return "";

  if (status === "very-late") return "Very Late";
  if (status === "on-time") return "On Time";

  // default: capitalize first letter
  return status.charAt(0).toUpperCase() + status.slice(1);
};


const getStatusBadgeColor = () => {
  if (!todayStatus?.clockedIn) return "#94A3B8"; // gray

  if (todayStatus.clockInStatus === "very-late")
    return "#DC2626"; // red

  if (todayStatus.clockInStatus === "late")
    return "#f5690b"; // amber

  if (todayStatus.clockInStatus === "early")
    return "#22C55E"; // green

  if (todayStatus.clockInStatus === "on-time")
    return "#16A34A"; // darker green

  return "#0EA5E9"; // fallback blue
};

  // ================= PROGRESS =================
  const workedSeconds = liveSeconds;
  const expectedSeconds = getExpectedSecondsFromSchedule();

  const progress =
  expectedSeconds > 0
    ? Math.min(liveSeconds / expectedSeconds, 1)
    : 0;

  const isOvertime = liveSeconds > expectedSeconds;


  const getProgressColor = () => {
  if (!todayStatus?.clockedIn) return "#CBD5E1";
  if (isOvertime) return "#7C3AED"; // overtime purple
  if (progress >= 1) return "#16A34A";
  if (progress >= 0.75) return "#22C55E";
  if (progress >= 0.5) return "#F59E0B";
  return "#0EA5E9";
};

  const size = 240;
  const radius = 90;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.userRow}>
            <Image
              source={
                user?.avatar?.startsWith("http")
                  ? { uri: user.avatar }
                  : logo
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.role}>
                {todayStatus?.clockedOut ? "Off Duty" : "On Duty"}
              </Text>
            </View>
          </View>
          <Ionicons name="notifications-outline" size={22} />
        </View>

        {/* PROGRESS RING */}
        <View style={styles.card}>
          <View style={styles.ringWrapper}>
            <Svg width={size} height={size}>
              <Circle
                stroke="#E5E7EB"
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <Circle
                stroke={getProgressColor()}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2},${size / 2}`}
              />
            </Svg>
            <View style={styles.center}>
              <Text style={styles.timer}>
                {formatSeconds(liveSeconds)}
              </Text>

              {timeLeft > 0 ? (
                <Text style={styles.subInfo}>
                  Time Left: {formatSeconds(timeLeft)}
                </Text>
              ) : (
                <Text style={styles.completed}>
                  Shift Completed 🎉
                </Text>
              )}

              {isOvertime && (
                <Text style={styles.overtime}>
                  Overtime: +{formatSeconds(liveSeconds - expectedSeconds)}
                </Text>
              )}
            </View>
          </View>
        </View>

       {/* EXPECTED SCHEDULE */}
        {schedule && (
          <View style={styles.scheduleCard}>
            <Text style={styles.sectionTitle}>
              Expected Schedule
            </Text>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Start</Text>
              <Text style={styles.scheduleValue}>
                {schedule.expectedStartTime || "--"}
              </Text>
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>End</Text>
              <Text style={styles.scheduleValue}>
                {schedule.expectedEndTime || "--"}
              </Text>
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Duration</Text>
              <Text style={styles.scheduleValue}>
                {getExpectedDurationText()}
              </Text>
            </View>
          </View>
        )}

        {/* STATUS */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>Clocked In</Text>
            <Text style={styles.statusTime}>
              {formatTime(todayStatus?.clockInTime)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBadgeColor() },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* RECENT CLOCKINS */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>
            Recent Clock-ins
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push(
                "/dashboard/staffDashboard/clockIn/history"
              )
            }
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          {history.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#64748B" }}>
              No history yet
            </Text>
          ) : (
            history.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyDate}>
                    {new Date(item.clockIn?.time).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={styles.historyTime}>
                    In: {formatTime(item.clockIn?.time)}  Out:{" "}
                    {formatTime(item.clockOut?.time)}
                  </Text>
                </View>
                <Text
                  style={{
                    color: getHistoryColor(item.clockIn?.status),
                    fontWeight: "600",
                  }}
                >
                 {formatStatusText(item.clockIn?.status)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* CLOCK OUT */}
        <TouchableOpacity
          style={[
            styles.btn,
            (todayStatus?.clockedOut || clockingOut) && {
              backgroundColor: "#94A3B8",
            },
          ]}
          disabled={todayStatus?.clockedOut || clockingOut}
          onPress={() => setShowConfirm(true)}
        >
          {clockingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {todayStatus?.clockedOut
                ? "Clocked Out"
                : "Clock Out"}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
      <ResponseModal
        visible={showConfirm}
        type="error"
        title="Confirm Clock Out"
        message="Are you sure you want to clock out?"
        onClose={() => setShowConfirm(false)}
        onConfirm={async () => {
          setShowConfirm(false);
          await handleClockOut(false);
        }}
        confirmText="Yes, Clock Out"
      />

      <BottomNav role="staff" />
    </SafeAreaView>
  );
}

// ======================= STYLES =======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20, paddingBottom: 120 },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  userRow: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10,
  },

  name: { fontSize: 16, fontWeight: "bold" },
  role: { color: "#64748B", fontSize: 13 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  ringWrapper: { justifyContent: "center", alignItems: "center" },
  center: { position: "absolute", alignItems: "center" },

  timer: { fontSize: 28, fontWeight: "bold" },
  label: { color: "#64748B", marginTop: 4 },
  scheduleCard: {
  backgroundColor: "#fff",
  borderRadius: 15,
  padding: 15,
  marginBottom: 20,
},

scheduleRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
},

scheduleLabel: {
  color: "#64748B",
  fontSize: 13,
},

scheduleValue: {
  fontWeight: "bold",
  fontSize: 14,
},

  statusCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statusLabel: { color: "#64748B", fontSize: 12 },
  statusTime: { fontWeight: "bold", fontSize: 16 },
  statusBadge: {
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 20,
  alignSelf: "flex-start",
},

statusBadgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
},

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: { fontWeight: "bold", fontSize: 16 },
  viewAll: { color: "#0EA5E9" },

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },

  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  historyDate: { fontWeight: "bold" },
  historyTime: { color: "#64748B", fontSize: 12 },
  historyStatus: { fontWeight: "600", color: "#0EA5E9" },

  btn: {
    backgroundColor: "#0EA5E9",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  
  subInfo: {
  color: "#64748B",
  fontSize: 12,
  marginTop: 4,
},

overtime: {
  color: "#7C3AED",
  fontSize: 12,
  fontWeight: "600",
  marginTop: 2,
},

completed: {
  color: "#16A34A",
  fontSize: 12,
  fontWeight: "600",
  marginTop: 4,
},
  btnText: { color: "#fff", fontWeight: "bold" },
});

