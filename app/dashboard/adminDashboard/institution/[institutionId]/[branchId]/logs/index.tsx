// ======================= BranchAttendance.tsx =======================

import React, {
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
import { useLocalSearchParams, useRouter } from "expo-router";

import BottomNav from "@/components/BottomNav";
import { useBranchAttendance } from "@/hooks/useBranchAttendance";

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

/* ================= TYPES ================= */

type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "incomplete"
  | "on-leave"
  | "remote"
  | string;

type AttendanceRecord = {
  id: string;
  date: string;
  day: string;
  attendanceStatus: AttendanceStatus;

  staff: {
    id: string;
    name: string;
    email?: string;
    staffId?: string;
    department?: string;
    jobTitle?: string;
    avatar?: string | null;
  };

  schedule?: {
    name?: string;
    expectedStartTime?: string;
    expectedEndTime?: string;
    expectedMinutes?: number;
  };

  clockIn?: {
    time?: string | null;
    localTime?: string | null;
    status?: string;
    minutesLate?: number;
    method?: string;
    location?: {
      verified?: boolean;
      distanceFromBranchMeters?: number;
    };
  } | null;

  clockOut?: {
    time?: string | null;
    localTime?: string | null;
    status?: string;
    method?: string;
    location?: {
      verified?: boolean;
      distanceFromBranchMeters?: number;
    };
  } | null;

  workedMinutes: number;
  workedHours: number;
  expectedMinutes: number;
  remainingMinutes: number;
  overtimeMinutes: number;

  isLate: boolean;
  isVeryLate: boolean;
  isIncomplete: boolean;
  isOvertime: boolean;
  locationVerified: boolean;
  approved: boolean;

  approvedBy?: {
    id: string;
    name: string;
  } | null;

  approvedAt?: string | null;
  notes?: string | null;
};

type AttendanceResponse = {
  branch: {
    id: string;
    name: string;
    code?: string;
    address?: string;
    timezone?: string;
    locationVerificationRequired?: boolean;
    status?: string;
  };

  dateRange: {
    from: string;
    to: string;
    timezone?: string;
  };

  summary: {
    totalStaff: number;
    scheduledStaff: number;
    presentStaff: number;
    lateStaff: number;
    absentStaff: number;
    incompleteStaff: number;
    onLeaveStaff: number;
    totalClockIns: number;
    totalClockOuts: number;
    totalWorkedMinutes: number;
    totalWorkedHours: number;
    expectedMinutes: number;
    expectedHours: number;
    attendanceRatePercent: number;
    punctualityRatePercent: number;
    completionRatePercent: number;
  };

  records: AttendanceRecord[];

  pagination?: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

/* ================= FILTERS ================= */

const FILTERS = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "present",
    label: "Present",
  },
  {
    key: "late",
    label: "Late",
  },
  {
    key: "absent",
    label: "Absent",
  },
  {
    key: "incomplete",
    label: "Incomplete",
  },
];

/* ================= SCREEN ================= */

export default function BranchAttendance({
  branchId,
}: {
  branchId: string;
}) {
  const router = useRouter();


  const [search, setSearch] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("all");

  const {
    data: rawData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBranchAttendance(branchId);

  const data =
    rawData as AttendanceResponse | undefined;

  const records = data?.records || [];
  const summary = data?.summary;

  const filteredRecords = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return records.filter((record) => {
      const status =
        record.attendanceStatus?.toLowerCase() ||
        "";

      const matchesFilter =
        activeFilter === "all" ||
        status === activeFilter;

      const matchesSearch =
        !normalizedSearch ||
        record.staff?.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        record.staff?.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        record.staff?.staffId
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        record.staff?.department
          ?.toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesFilter && matchesSearch
      );
    });
  }, [
    records,
    search,
    activeFilter,
  ]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
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
            Retrieving branch attendance records...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="calendar-outline"
              size={35}
              color={COLORS.danger}
            />
          </View>

          <Text style={styles.errorTitle}>
            Attendance unavailable
          </Text>

          <Text style={styles.errorText}>
            {error?.message ||
              "We could not load attendance records for this branch."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <View style={styles.headerText}>
              <Text style={styles.headerEyebrow}>
                BRANCH RECORD
              </Text>

              <Text style={styles.headerTitle}>
                Attendance Logs
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

          {/* DATE RANGE */}

          <View style={styles.dateRangeCard}>
            <View style={styles.dateRangeIcon}>
              <Ionicons
                name="calendar-number-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.dateRangeContent}>
              <Text style={styles.dateRangeLabel}>
                REPORTING PERIOD
              </Text>

              <Text style={styles.dateRangeText}>
                {formatShortDate(
                  data.dateRange?.from
                )}{" "}
                -{" "}
                {formatShortDate(
                  data.dateRange?.to
                )}
              </Text>
            </View>

            <Text style={styles.timezoneText}>
              {data.dateRange?.timezone ||
                "Africa/Lagos"}
            </Text>
          </View>

          {/* SUMMARY */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Attendance overview
              </Text>

              <Text style={styles.sectionSubtitle}>
                Summary for this reporting period
              </Text>
            </View>

            <View style={styles.totalStaffBadge}>
              <Text style={styles.totalStaffNumber}>
                {summary?.totalStaff || 0}
              </Text>

              <Text style={styles.totalStaffLabel}>
                staff
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              label="Present"
              value={summary?.presentStaff || 0}
              description="Staff attended"
              icon="checkmark-circle-outline"
              color={COLORS.success}
              background={COLORS.successLight}
            />

            <SummaryCard
              label="Late"
              value={summary?.lateStaff || 0}
              description="Staff arrived late"
              icon="time-outline"
              color={COLORS.warning}
              background={COLORS.warningLight}
            />

            <SummaryCard
              label="Absent"
              value={summary?.absentStaff || 0}
              description="No attendance"
              icon="close-circle-outline"
              color={COLORS.danger}
              background={COLORS.dangerLight}
            />

            <SummaryCard
              label="Incomplete"
              value={summary?.incompleteStaff || 0}
              description="Missing clock-out"
              icon="alert-circle-outline"
              color={COLORS.purple}
              background="#F3E8FF"
            />
          </View>

          {/* RATE CARD */}

          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <View>
                <Text style={styles.rateTitle}>
                  Attendance rate
                </Text>

                <Text style={styles.rateSubtitle}>
                  Staff attendance compared with scheduled staff
                </Text>
              </View>

              <Text style={styles.ratePercentage}>
                {summary?.attendanceRatePercent || 0}%
              </Text>
            </View>

            <View style={styles.rateTrack}>
              <View
                style={[
                  styles.rateFill,
                  {
                    width: `${Math.min(
                      Math.max(
                        summary?.attendanceRatePercent || 0,
                        0
                      ),
                      100
                    )}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.rateFooter}>
              <Text style={styles.rateFooterText}>
                {summary?.presentStaff || 0} of{" "}
                {summary?.scheduledStaff || 0} scheduled staff attended
              </Text>

              <Text style={styles.rateFooterText}>
                {summary?.totalClockIns || 0} clock-ins
              </Text>
            </View>
          </View>

          {/* SEARCH */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Staff attendance logs
              </Text>

              <Text style={styles.sectionSubtitle}>
                Search and filter staff records
              </Text>
            </View>

            <Text style={styles.recordCount}>
              {filteredRecords.length}
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
              placeholder="Search staff name, email, or ID"
              placeholderTextColor={COLORS.subtle}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
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
            contentContainerStyle={styles.filters}
          >
            {FILTERS.map((filter) => {
              const selected =
                activeFilter === filter.key;

              return (
                <Pressable
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    selected &&
                      styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setActiveFilter(filter.key)
                  }
                >
                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={COLORS.white}
                    />
                  )}

                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* RECORDS */}

          {filteredRecords.length === 0 ? (
            <EmptyState
              search={search}
              filter={activeFilter}
              onClear={() => {
                setSearch("");
                setActiveFilter("all");
              }}
            />
          ) : (
            <View style={styles.recordsList}>
              {filteredRecords.map((record) => (
                <AttendanceRecordCard
                  key={record.id}
                  record={record}
                />
              ))}
            </View>
          )}

          <View style={styles.footerNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={COLORS.success}
            />

            <Text style={styles.footerText}>
              Attendance records are calculated from clock-in and clock-out activity.
            </Text>
          </View>
        </ScrollView>

        <BottomNav dashboardType="admin" />
      </View>
    </SafeAreaView>
  );
}

/* ================= SUMMARY CARD ================= */

function SummaryCard({
  label,
  value,
  description,
  icon,
  color,
  background,
}: {
  label: string;
  value: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
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
          styles.summaryValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryDescription}>
        {description}
      </Text>
    </View>
  );
}

/* ================= ATTENDANCE CARD ================= */

function AttendanceRecordCard({
  record,
}: {
  record: AttendanceRecord;
}) {
  const color = getStatusColor(
    record.attendanceStatus
  );

  const isComplete =
    Boolean(record.clockIn?.time) &&
    Boolean(record.clockOut?.time);

  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.staffIdentity}>
          <View
            style={[
              styles.staffIcon,
              {
                backgroundColor: `${color}18`,
              },
            ]}
          >
            <Ionicons
              name="person"
              size={20}
              color={color}
            />
          </View>

          <View style={styles.staffIdentityText}>
            <Text
              style={styles.staffName}
              numberOfLines={1}
            >
              {record.staff?.name || "Unknown staff"}
            </Text>

            <Text
              style={styles.staffDetails}
              numberOfLines={1}
            >
              {record.staff?.staffId ||
                record.staff?.email ||
                "No staff ID"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${color}18`,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: color,
              },
            ]}
          />

          <Text
            style={[
              styles.statusBadgeText,
              {
                color,
              },
            ]}
          >
            {formatStatus(
              record.attendanceStatus
            )}
          </Text>
        </View>
      </View>

      <View style={styles.recordMeta}>
        <View style={styles.metaItem}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={COLORS.muted}
          />

          <Text style={styles.metaText}>
            {formatLongDate(record.date)}
          </Text>
        </View>

        {record.staff?.department && (
          <View style={styles.metaItem}>
            <Ionicons
              name="briefcase-outline"
              size={15}
              color={COLORS.muted}
            />

            <Text
              style={styles.metaText}
              numberOfLines={1}
            >
              {record.staff.department}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.timeGrid}>
        <TimeBlock
          icon="log-in-outline"
          label="Clock in"
          value={formatTime(
            record.clockIn?.localTime ||
              record.clockIn?.time
          )}
          color={COLORS.success}
          background={COLORS.successLight}
        />

        <TimeBlock
          icon="log-out-outline"
          label="Clock out"
          value={formatTime(
            record.clockOut?.localTime ||
              record.clockOut?.time
          )}
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

        <TimeBlock
          icon="time-outline"
          label="Worked"
          value={formatDuration(
            record.workedMinutes
          )}
          color={COLORS.primary}
          background={COLORS.primaryLight}
        />
      </View>

      <View style={styles.recordFooter}>
        <View style={styles.footerStatusItem}>
          <Ionicons
            name={
              record.locationVerified
                ? "location-outline"
                : "location-outline"
            }
            size={14}
            color={
              record.locationVerified
                ? COLORS.success
                : COLORS.warning
            }
          />

          <Text
            style={[
              styles.footerStatusText,
              {
                color:
                  record.locationVerified
                    ? COLORS.success
                    : COLORS.warning,
              },
            ]}
          >
            {record.locationVerified
              ? "Location verified"
              : "Location not verified"}
          </Text>
        </View>

        <View style={styles.footerStatusItem}>
          <Ionicons
            name={
              record.approved
                ? "checkmark-circle-outline"
                : "time-outline"
            }
            size={14}
            color={
              record.approved
                ? COLORS.success
                : COLORS.warning
            }
          />

          <Text
            style={[
              styles.footerStatusText,
              {
                color:
                  record.approved
                    ? COLORS.success
                    : COLORS.warning,
              },
            ]}
          >
            {record.approved
              ? "Approved"
              : "Pending review"}
          </Text>
        </View>
      </View>

      {record.isLate && (
        <View style={styles.notice}>
          <Ionicons
            name="alert-circle-outline"
            size={15}
            color={COLORS.warning}
          />

          <Text style={styles.noticeText}>
            {record.clockIn?.minutesLate || 0} minutes late
          </Text>
        </View>
      )}

      {record.isIncomplete && (
        <View style={styles.incompleteNotice}>
          <Ionicons
            name="warning-outline"
            size={15}
            color={COLORS.purple}
          />

          <Text style={styles.incompleteText}>
            This shift has no completed clock-out.
          </Text>
        </View>
      )}

      {record.notes && (
        <Text style={styles.notes}>
          Note: {record.notes}
        </Text>
      )}
    </View>
  );
}

/* ================= TIME BLOCK ================= */

function TimeBlock({
  icon,
  label,
  value,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.timeBlock}>
      <View
        style={[
          styles.timeIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={color}
        />
      </View>

      <Text style={styles.timeLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.timeValue,
          {
            color:
              value === "--:--"
                ? COLORS.subtle
                : COLORS.text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ================= EMPTY STATE ================= */

function EmptyState({
  search,
  filter,
  onClear,
}: {
  search: string;
  filter: string;
  onClear: () => void;
}) {
  const hasFilter =
    Boolean(search) || filter !== "all";

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            hasFilter
              ? "search-outline"
              : "calendar-clear-outline"
          }
          size={30}
          color={COLORS.subtle}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {hasFilter
          ? "No matching records"
          : "No attendance records"}
      </Text>

      <Text style={styles.emptyText}>
        {hasFilter
          ? "Try changing your search or filter."
          : "Staff attendance records will appear here."}
      </Text>

      {hasFilter && (
        <Pressable
          style={styles.clearButton}
          onPress={onClear}
        >
          <Text style={styles.clearButtonText}>
            Clear filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ================= HELPERS ================= */

function formatStatus(value?: string) {
  if (!value) return "Unknown";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusColor(status?: string) {
  const normalized =
    status?.toLowerCase() || "";

  if (
    normalized.includes("late")
  ) {
    return COLORS.warning;
  }

  if (
    normalized.includes("absent")
  ) {
    return COLORS.danger;
  }

  if (
    normalized.includes("incomplete")
  ) {
    return COLORS.purple;
  }

  if (
    normalized.includes("leave")
  ) {
    return "#2563EB";
  }

  if (
    normalized.includes("present") ||
    normalized.includes("remote")
  ) {
    return COLORS.success;
  }

  return COLORS.primary;
}

function formatShortDate(
  value?: string
) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLongDate(
  value?: string
) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(
  value?: string | null
) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(
  minutes?: number
) {
  const totalMinutes = Math.max(
    Number(minutes || 0),
    0
  );

  const hours = Math.floor(
    totalMinutes / 60
  );

  const remainingMinutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
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
    paddingBottom: 125,
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
    backgroundColor: COLORS.primaryLight,
    borderRadius: 23,
  },

  loadingTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  loadingText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
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
    marginTop: 15,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  errorText: {
    maxWidth: 290,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 20,
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

  headerText: {
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
    fontSize: 23,
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

  branchCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
  },

  branchIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },

  branchContent: {
    flex: 1,
    marginLeft: 10,
  },

  branchLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  branchName: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  branchAddress: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  branchStatus: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  branchStatusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  dateRangeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 13,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 17,
  },

  dateRangeIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },

  dateRangeContent: {
    flex: 1,
    marginLeft: 9,
  },

  dateRangeLabel: {
    color: COLORS.primaryDark,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  dateRangeText: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  timezoneText: {
    color: COLORS.primaryDark,
    fontSize: 9,
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 24,
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

  totalStaffBadge: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 11,
  },

  totalStaffNumber: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  totalStaffLabel: {
    color: COLORS.primaryDark,
    fontSize: 8,
    fontWeight: "800",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  summaryCard: {
    width: "48.5%",
    minHeight: 127,
    padding: 13,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
  },

  summaryIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  summaryValue: {
    marginTop: 9,
    fontSize: 23,
    fontWeight: "900",
  },

  summaryLabel: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
  },

  summaryDescription: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
  },

  rateCard: {
    marginTop: 5,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
  },

  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rateTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  rateSubtitle: {
    maxWidth: 245,
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  ratePercentage: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "900",
  },

  rateTrack: {
    height: 10,
    marginTop: 17,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },

  rateFill: {
    height: "100%",
    minWidth: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },

  rateFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  rateFooterText: {
    color: COLORS.muted,
    fontSize: 9,
  },

  recordCount: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 11,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 51,
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

  filters: {
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

  filterText: {
    marginLeft: 2,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },

  filterTextActive: {
    color: COLORS.white,
  },

  recordsList: {
    marginTop: 3,
  },

  recordCard: {
    marginBottom: 13,
    padding: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  staffIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  staffIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  staffIdentityText: {
    flex: 1,
    marginLeft: 10,
  },

  staffName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  staffDetails: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 105,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
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

  recordMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  metaText: {
    flex: 1,
    marginLeft: 5,
    color: COLORS.muted,
    fontSize: 10,
  },

  timeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
  },

  timeBlock: {
    alignItems: "center",
    flex: 1,
  },

  timeIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  timeLabel: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 9,
  },

  timeValue: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "900",
  },

  recordFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  footerStatusItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerStatusText: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: "800",
  },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
    padding: 9,
    backgroundColor: COLORS.warningLight,
    borderRadius: 9,
  },

  noticeText: {
    marginLeft: 5,
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: "800",
  },

  incompleteNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
    padding: 9,
    backgroundColor: "#F3E8FF",
    borderRadius: 9,
  },

  incompleteText: {
    marginLeft: 5,
    color: COLORS.purple,
    fontSize: 10,
    fontWeight: "800",
  },

  notes: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 10,
    fontStyle: "italic",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 45,
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
    backgroundColor: "#F1F5F9",
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

  clearButton: {
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: COLORS.primary,
    borderRadius: 11,
  },

  clearButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 19,
    paddingHorizontal: 18,
  },

  footerText: {
    marginLeft: 6,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
  },
});
