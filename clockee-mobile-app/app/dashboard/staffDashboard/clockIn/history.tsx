// ======================= StaffHistory.js =======================
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getClockHistory } from "../../../../services/clockServices";
import { useNavigation } from "@react-navigation/native";

export default function StaffHistory() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getClockHistory();
      setHistory(res?.data?.data || []);
    } catch (err) {
      console.log("HISTORY ERROR:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // ================= HELPERS =================

  const formatTime = (time) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return 0;
    const diff = new Date(outTime) - new Date(inTime);
    return diff / (1000 * 60 * 60);
  };

  const getStatusColor = (status) => {
    if (!status) return "#64748B";
    if (status.includes("late")) return "#EF4444";
    if (status.includes("early")) return "#F59E0B";
    if (status.includes("on_time")) return "#22C55E";
    return "#0EA5E9";
  };

  // ================= FILTERED DATA =================

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const status = item.clockIn?.status || "";
      const dateString = new Date(item.date).toDateString();

      const matchFilter =
        filter === "all" ? true : status.includes(filter);

      const matchSearch = dateString
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [history, filter, search]);

  // ================= SUMMARY =================

  const totalDays = history.length;

  const totalLate = history.filter((h) =>
    h.clockIn?.status?.includes("late")
  ).length;

  const totalHours = history.reduce((acc, item) => {
    return (
      acc +
      calculateHours(
        item.clockIn?.time,
        item.clockOut?.time
      )
    );
  }, 0);

  // ================= LOADER =================

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.title}>Attendance History</Text>

          <View style={{ width: 22 }} />
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalDays}</Text>
            <Text style={styles.summaryLabel}>Days</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalLate}</Text>
            <Text style={styles.summaryLabel}>Late</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {totalHours.toFixed(1)}h
            </Text>
            <Text style={styles.summaryLabel}>Hours</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search by date..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* FILTERS */}
        <View style={styles.filterRow}>
          {["all", "on_time", "late", "early"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                filter === item && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.activeFilterText,
                ]}
              >
                {item.replace("_", " ").toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* HISTORY LIST */}
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="time-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyText}>No matching records</Text>
          </View>
        ) : (
          filteredHistory.map((item, index) => {
            const inTime = item.clockIn?.time;
            const outTime = item.clockOut?.time;
            const status = item.clockIn?.status;

            return (
              <View key={index} style={styles.card}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>
                     {new Date(item.clockIn?.time).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getStatusColor(status) + "20" },
                    ]}
                  >                    
                    <Text
                      style={[
                        styles.badgeText,
                        { color: getStatusColor(status) },
                      ]}
                    >
                      {status || "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeValue}>
                      {formatTime(inTime)}
                    </Text>
                    <Text style={styles.timeLabel}>Clock In</Text>
                  </View>

                  <View style={styles.timeBox}>
                    <Text style={styles.timeValue}>
                      {formatTime(outTime)}
                    </Text>
                    <Text style={styles.timeLabel}>Clock Out</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================= STYLES =======================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingBottom: 50 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: { fontSize: 18, fontWeight: "700", color: "#0F172A" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0EA5E9",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    padding: 10,
    color: "#0F172A",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },

  activeFilter: {
    backgroundColor: "#0EA5E9",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    marginTop: 10,
    color: "#94A3B8",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dateText: {
    fontWeight: "600",
    color: "#0F172A",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  timeBox: {
    alignItems: "center",
    flex: 1,
  },

  timeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  timeLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },
});
