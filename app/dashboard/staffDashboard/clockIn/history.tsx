// ======================= StaffHistory.js =======================

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { getClockHistory } from "../../../../services/clockServices";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#0284C7",
  primaryLight: "#E0F2FE",
  success: "#047857",
  successLight: "#ECFDF5",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  purple: "#7C3AED",
};

const FILTERS = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "on_time",
    label: "On time",
  },
  {
    key: "late",
    label: "Late",
  },
  {
    key: "early",
    label: "Early",
  },
];

export default function StaffHistory() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setError("");

      const response = await getClockHistory();

      setHistory(
        Array.isArray(response?.data?.data)
          ? response.data.data
          : []
      );
    } catch (requestError) {
      console.error(
        "[StaffHistory] History error:",
        requestError?.response?.data ||
          requestError?.message
      );

      setError(
        "Unable to load your attendance history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const totalDays = history.length;

  const totalLate = history.filter((item) => {
    const status = getRecordStatus(item);

    return (
      status.includes("late") &&
      !status.includes("on-time")
    );
  }).length;

  const totalHours = history.reduce(
    (total, item) => {
      return (
        total +
        calculateHours(
          item.clockIn?.time,
          item.clockOut?.time
        )
      );
    },
    0
  );

  const completedDays = history.filter(
    (item) =>
      item.clockIn?.time &&
      item.clockOut?.time
  ).length;

  const filteredHistory = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return history
      .filter((item) => {
        const status = getRecordStatus(item);
        const normalizedStatus =
          normalizeStatus(status);

        const dateText = getSearchableDate(item);

        const matchesFilter =
          filter === "all" ||
          normalizedStatus.includes(
            normalizeStatus(filter)
          );

        const matchesSearch =
          !normalizedSearch ||
          dateText.includes(normalizedSearch) ||
          normalizedStatus.includes(
            normalizedSearch
          );

        return matchesFilter && matchesSearch;
      })
      .sort((first, second) => {
        const firstDate = getRecordDate(first);
        const secondDate = getRecordDate(second);

        return secondDate - firstDate;
      });
  }, [history, filter, search]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading attendance
          </Text>

          <Text style={styles.loadingText}>
            Retrieving your latest shift records...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.headerTextBox}>
              <Text style={styles.headerEyebrow}>
                ATTENDANCE
              </Text>

              <Text style={styles.headerTitle}>
                History
              </Text>

              <Text style={styles.headerSubtitle}>
                Review your previous shift records
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* SUMMARY */}

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>
                  Attendance overview
                </Text>

                <Text style={styles.summarySubtitle}>
                  Your recorded work activity
                </Text>
              </View>

              <View style={styles.summaryHeaderIcon}>
                <Ionicons
                  name="analytics-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryGrid}>
              <SummaryItem
                icon="calendar-outline"
                value={String(totalDays)}
                label="Total days"
                color={COLORS.primary}
                background={COLORS.primaryLight}
              />

              <SummaryItem
                icon="alert-circle-outline"
                value={String(totalLate)}
                label="Late days"
                color={COLORS.warning}
                background={COLORS.warningLight}
              />

              <SummaryItem
                icon="time-outline"
                value={`${totalHours.toFixed(1)}h`}
                label="Worked hours"
                color={COLORS.success}
                background={COLORS.successLight}
              />
            </View>
          </View>

          {/* COMPLETION INFO */}

          <View style={styles.completionCard}>
            <View style={styles.completionIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={21}
                color={COLORS.success}
              />
            </View>

            <View style={styles.completionContent}>
              <Text style={styles.completionTitle}>
                {completedDays} completed{" "}
                {completedDays === 1
                  ? "shift"
                  : "shifts"}
              </Text>

              <Text style={styles.completionText}>
                Records with both clock-in and clock-out times.
              </Text>
            </View>
          </View>

          {/* ERROR */}

          {error ? (
            <View style={styles.errorCard}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={COLORS.danger}
                />
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  Something went wrong
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  style={styles.retryButton}
                  onPress={fetchHistory}
                >
                  <Text style={styles.retryText}>
                    Try again
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* SEARCH */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Shift records
              </Text>

              <Text style={styles.sectionSubtitle}>
                Search and filter your attendance
              </Text>
            </View>

            <Text style={styles.recordCount}>
              {filteredHistory.length}
            </Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color={COLORS.subtle}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search date or status"
              placeholderTextColor={COLORS.subtle}
              style={styles.searchInput}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />

            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={COLORS.subtle}
                />
              </Pressable>
            )}
          </View>

          {/* FILTERS */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {FILTERS.map((item) => {
              const isSelected =
                filter === item.key;

              return (
                <Pressable
                  key={item.key}
                  style={[
                    styles.filterChip,
                    isSelected &&
                      styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilter(item.key)
                  }
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={COLORS.white}
                    />
                  )}

                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* HISTORY LIST */}

          {filteredHistory.length === 0 ? (
            <EmptyState
              search={search}
              filter={filter}
              onReset={() => {
                setSearch("");
                setFilter("all");
              }}
            />
          ) : (
            <View style={styles.historyList}>
              {filteredHistory.map(
                (item, index) => (
                  <HistoryCard
                    key={
                      item.id ||
                      item._id ||
                      `${item.date}-${index}`
                    }
                    item={item}
                  />
                )
              )}
            </View>
          )}

          <View style={styles.footerNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={COLORS.success}
            />

            <Text style={styles.footerText}>
              Attendance records are securely calculated and stored.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ================= SUMMARY ITEM ================= */

function SummaryItem({
  icon,
  value,
  label,
  color,
  background,
}) {
  return (
    <View style={styles.summaryItem}>
      <View
        style={[
          styles.summaryItemIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <Text
        style={[
          styles.summaryItemValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.summaryItemLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ================= HISTORY CARD ================= */

function HistoryCard({ item }) {
  const inTime = item.clockIn?.time;
  const outTime = item.clockOut?.time;
  const status = getRecordStatus(item);
  const statusColor = getStatusColor(status);
  const workedHours = calculateHours(
    inTime,
    outTime
  );

  const isComplete =
    Boolean(inTime) && Boolean(outTime);

  return (
    <View style={styles.historyCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.dateBlock}>
          <View style={styles.dateIcon}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View>
            <Text style={styles.dateText}>
              {formatDate(inTime || item.date)}
            </Text>

            <Text style={styles.dateSubtext}>
              {getRelativeDate(inTime || item.date)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${statusColor}18`,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: statusColor,
              },
            ]}
          />

          <Text
            style={[
              styles.statusBadgeText,
              {
                color: statusColor,
              },
            ]}
          >
            {formatStatus(status)}
          </Text>
        </View>
      </View>

      <View style={styles.timeline}>
        <TimelineItem
          icon="log-in-outline"
          label="Clock in"
          value={formatTime(inTime)}
          color={COLORS.success}
          background={COLORS.successLight}
        />

        <View style={styles.timelineLine} />

        <TimelineItem
          icon="log-out-outline"
          label="Clock out"
          value={formatTime(outTime)}
          color={
            isComplete
              ? COLORS.danger
              : COLORS.subtle
          }
          background={
            isComplete
              ? COLORS.dangerLight
              : "#F1F5F9"
          }
        />
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.durationBlock}>
          <Ionicons
            name="time-outline"
            size={16}
            color={COLORS.muted}
          />

          <Text style={styles.durationLabel}>
            Worked
          </Text>

          <Text style={styles.durationValue}>
            {isComplete
              ? formatHours(workedHours)
              : "In progress"}
          </Text>
        </View>

        <View
          style={[
            styles.recordState,
            {
              backgroundColor: isComplete
                ? COLORS.successLight
                : COLORS.warningLight,
            },
          ]}
        >
          <Ionicons
            name={
              isComplete
                ? "checkmark-circle-outline"
                : "time-outline"
            }
            size={14}
            color={
              isComplete
                ? COLORS.success
                : COLORS.warning
            }
          />

          <Text
            style={[
              styles.recordStateText,
              {
                color: isComplete
                  ? COLORS.success
                  : COLORS.warning,
              },
            ]}
          >
            {isComplete
              ? "Completed"
              : "Open shift"}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ================= TIMELINE ITEM ================= */

function TimelineItem({
  icon,
  label,
  value,
  color,
  background,
}) {
  return (
    <View style={styles.timelineItem}>
      <View
        style={[
          styles.timelineIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={color}
        />
      </View>

      <View>
        <Text style={styles.timelineLabel}>
          {label}
        </Text>

        <Text style={styles.timelineValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ================= EMPTY STATE ================= */

function EmptyState({
  search,
  filter,
  onReset,
}) {
  const hasFilters =
    Boolean(search) || filter !== "all";

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            hasFilters
              ? "search-outline"
              : "calendar-clear-outline"
          }
          size={30}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {hasFilters
          ? "No matching records"
          : "No attendance records"}
      </Text>

      <Text style={styles.emptyText}>
        {hasFilters
          ? "Try changing your search or filter."
          : "Your attendance history will appear here."}
      </Text>

      {hasFilters && (
        <Pressable
          style={styles.resetButton}
          onPress={onReset}
        >
          <Text style={styles.resetButtonText}>
            Clear filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ================= HELPERS ================= */

function getRecordStatus(item) {
  return (
    item?.clockIn?.status ||
    item?.status ||
    "unknown"
  ).toLowerCase();
}

function normalizeStatus(value = "") {
  return value
    .toLowerCase()
    .replace(/[-_\s]/g, "");
}

function getRecordDate(item) {
  const value =
    item?.clockIn?.time ||
    item?.date ||
    item?.clockIn?.date;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}

function getSearchableDate(item) {
  const date = new Date(
    item?.clockIn?.time ||
      item?.date ||
      item?.clockIn?.date
  );

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.toDateString(),
    date.toLocaleDateString("en-GB"),
    date.toLocaleDateString("en-US"),
    formatDate(date),
  ]
    .join(" ")
    .toLowerCase();
}

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRelativeDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const recordDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference =
    todayDate.getTime() -
    recordDate.getTime();

  const day = 24 * 60 * 60 * 1000;

  if (difference === 0) {
    return "Today";
  }

  if (difference === day) {
    return "Yesterday";
  }

  if (difference > day) {
    return `${Math.floor(
      difference / day
    )} days ago`;
  }

  return "";
}

function formatTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function calculateHours(inTime, outTime) {
  if (!inTime || !outTime) {
    return 0;
  }

  const start = new Date(inTime).getTime();
  const end = new Date(outTime).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end <= start
  ) {
    return 0;
  }

  return (
    (end - start) / (1000 * 60 * 60)
  );
}

function formatHours(hours) {
  if (!hours || hours <= 0) {
    return "0m";
  }

  const totalMinutes = Math.round(
    hours * 60
  );

  const displayHours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  if (displayHours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${displayHours}h`;
  }

  return `${displayHours}h ${minutes}m`;
}

function formatStatus(value = "") {
  if (!value) return "Unknown";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusColor(status = "") {
  const normalized = normalizeStatus(status);

  if (
    normalized.includes("verylate") ||
    normalized === "late"
  ) {
    return COLORS.danger;
  }

  if (normalized.includes("early")) {
    return COLORS.warning;
  }

  if (
    normalized.includes("ontime") ||
    normalized.includes("completed")
  ) {
    return COLORS.success;
  }

  if (normalized.includes("absent")) {
    return COLORS.danger;
  }

  return COLORS.primary;
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 45,
  },

  centerState: {
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
    backgroundColor: COLORS.primaryLight,
    borderRadius: 22,
  },

  loadingTitle: {
    marginTop: 17,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  loadingText: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  headerTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  headerTitle: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
  },

  headerSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
  },

  headerIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },

  summaryCard: {
    padding: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  summarySubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  summaryHeaderIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },

  summaryDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: COLORS.border,
  },

  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryItem: {
    alignItems: "center",
    width: "32%",
  },

  summaryItemIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },

  summaryItemValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "900",
  },

  summaryItemLabel: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  completionCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    padding: 13,
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 17,
  },

  completionIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
  },

  completionContent: {
    flex: 1,
    marginLeft: 10,
  },

  completionTitle: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "900",
  },

  completionText: {
    marginTop: 3,
    color: "#166534",
    fontSize: 10,
  },

  errorCard: {
    flexDirection: "row",
    marginTop: 13,
    padding: 13,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 17,
  },

  errorIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "900",
  },

  errorText: {
    marginTop: 3,
    color: "#B91C1C",
    fontSize: 10,
    lineHeight: 15,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  retryText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 25,
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

  recordCount: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
  },

  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 9,
    color: COLORS.text,
    fontSize: 12,
  },

  filterContent: {
    paddingVertical: 13,
    paddingRight: 10,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterChipText: {
    marginLeft: 2,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },

  filterChipTextActive: {
    color: COLORS.white,
  },

  historyList: {
    marginTop: 3,
  },

  historyCard: {
    marginBottom: 13,
    padding: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dateIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },

  dateText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  dateSubtext: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 120,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 4,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  timeline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  timelineIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 11,
  },

  timelineLabel: {
    color: COLORS.muted,
    fontSize: 9,
  },

  timelineValue: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  timelineLine: {
    width: 25,
    height: 1,
    marginHorizontal: 5,
    backgroundColor: COLORS.border,
  },

  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  durationBlock: {
    flexDirection: "row",
    alignItems: "center",
  },

  durationLabel: {
    marginLeft: 5,
    color: COLORS.muted,
    fontSize: 10,
  },

  durationValue: {
    marginLeft: 5,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
  },

  recordState: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  recordStateText: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: "900",
  },

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 42,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 21,
  },

  emptyTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  emptyText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
  },

  resetButton: {
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },

  resetButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 20,
  },

  footerText: {
    marginLeft: 6,
    color: COLORS.muted,
    fontSize: 9,
    textAlign: "center",
  },
});
