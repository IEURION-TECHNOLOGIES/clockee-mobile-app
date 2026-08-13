// ActivityLogsTab.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AttendanceCard from "./AttendanceCard";
import BranchCard from "./BranchCard";
import BillingCard from "./BillingCard";
import StaffCard from "./StaffCard";

import { useOwnerActivityLogs } from "@/hooks/useOwnerActivityLogs";

import {
  BranchLog,
  BillingLog,
  MonthName,
  StaffAttendance,
  StaffLog,
} from "@/services/superAdminServices";

type CategoryFilter =
  | "all"
  | "attendance"
  | "branch"
  | "subscription"
  | "staff";

type CategoryLog =
  | "branch"
  | "subscription"
  | "staff";

type CategoryOption = {
  key: CategoryFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CATEGORIES: CategoryOption[] = [
  {
    key: "all",
    label: "All Logs",
    icon: "grid-outline",
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: "time-outline",
  },
  {
    key: "branch",
    label: "Branch",
    icon: "git-branch-outline",
  },
  {
    key: "subscription",
    label: "Billing",
    icon: "card-outline",
  },
  {
    key: "staff",
    label: "Staff",
    icon: "people-outline",
  },
];

const MONTHS: {
  key: MonthName;
  label: string;
}[] = [
  { key: "january", label: "January" },
  { key: "february", label: "February" },
  { key: "march", label: "March" },
  { key: "april", label: "April" },
  { key: "may", label: "May" },
  { key: "june", label: "June" },
  { key: "july", label: "July" },
  { key: "august", label: "August" },
  { key: "september", label: "September" },
  { key: "october", label: "October" },
  { key: "november", label: "November" },
  { key: "december", label: "December" },
];

type ActivityLog = {
  id: string;
  timestamp: string;
  action: string;
  actor: {
    id?: string;
    name: string;
    role: string;
  };
  target?: {
    type: string;
    id?: string;
    name?: string;
  };
  description: string;
  category: CategoryLog;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  month: string;
  week: string;
  day: string;
  amount?: string;
  amountValue?: number;
  currency?: string;
};

type ActivityLogsTabProps = {
  institutionId: string;
};

export default function ActivityLogsTab({
  institutionId,
}: ActivityLogsTabProps) {
  const currentDate = new Date();

  const defaultMonth =
    currentDate
      .toLocaleString("en-US", {
        month: "long",
      })
      .toLowerCase() as MonthName;

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("all");

  const [selectedMonth, setSelectedMonth] =
    useState<MonthName>(defaultMonth);

  const [selectedYear, setSelectedYear] =
    useState(currentDate.getFullYear());

  const [showMonthPicker, setShowMonthPicker] =
    useState(false);

  const [showTypePicker, setShowTypePicker] =
    useState(false);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOwnerActivityLogs({
    institutionId,
    month: selectedMonth,
    year: selectedYear,
  });

  const attendance: StaffAttendance[] =
    response?.data?.attendance || [];

  const branchLogsFromApi: BranchLog[] =
    response?.data?.branchLogs || [];

  const billingLogsFromApi: BillingLog[] =
    response?.data?.billingLogs || [];

  const staffLogsFromApi: StaffLog[] =
    response?.data?.staffLogs || [];

  const activityLogs = useMemo(() => {
    const branchLogs: ActivityLog[] =
      branchLogsFromApi.map((log) => ({
        ...log,
        category: "branch",
        icon: getBranchLogIcon(log.action),
        color: getBranchLogColor(log.action),
      }));

    const billingLogs: ActivityLog[] =
      billingLogsFromApi.map((log) => ({
        ...log,
        category: "subscription",
        icon: getBillingLogIcon(log.action),
        color: getBillingLogColor(log.action),
      }));

    const staffLogs: ActivityLog[] =
      staffLogsFromApi.map((log) => ({
        ...log,
        category: "staff",
        icon: getStaffLogIcon(log.action),
        color: getStaffLogColor(log.action),
      }));

    return [
      ...branchLogs,
      ...billingLogs,
      ...staffLogs,
    ];
  }, [
    branchLogsFromApi,
    billingLogsFromApi,
    staffLogsFromApi,
  ]);

  const branchLogs = useMemo(
    () =>
      activityLogs.filter(
        (log) => log.category === "branch"
      ),
    [activityLogs]
  );

  const billingLogs = useMemo(
    () =>
      activityLogs.filter(
        (log) =>
          log.category === "subscription"
      ),
    [activityLogs]
  );

  const staffLogs = useMemo(
    () =>
      activityLogs.filter(
        (log) => log.category === "staff"
      ),
    [activityLogs]
  );

  const normalizedSearch = search
    .trim()
    .toLowerCase();

  const matchesSearch = (
    value?: string | null
  ) => {
    if (!normalizedSearch) {
      return true;
    }

    return Boolean(value)
      ? value!.toLowerCase().includes(normalizedSearch)
      : false;
  };

  const filteredStaffAttendance = useMemo(() => {
    const matchesCategory =
      categoryFilter === "all" ||
      categoryFilter === "attendance";

    if (!matchesCategory) {
      return [];
    }

    return attendance.filter((staff) => {
      return (
        matchesSearch(staff.name) ||
        matchesSearch(staff.staffId) ||
        matchesSearch(staff.department) ||
        matchesSearch(staff.branch) ||
        matchesSearch(staff.role)
      );
    });
  }, [
    attendance,
    categoryFilter,
    normalizedSearch,
  ]);

  const filterActivityLogs = (
    logs: ActivityLog[],
    category: CategoryFilter
  ) => {
    const matchesCategory =
      categoryFilter === "all" ||
      categoryFilter === category;

    if (!matchesCategory) {
      return [];
    }

    return logs.filter((log) => {
      return (
        matchesSearch(log.description) ||
        matchesSearch(log.action) ||
        matchesSearch(log.actor?.name) ||
        matchesSearch(log.actor?.role) ||
        matchesSearch(log.target?.name)
      );
    });
  };

  const filteredBranchLogs = useMemo(
    () =>
      filterActivityLogs(
        branchLogs,
        "branch"
      ),
    [
      branchLogs,
      categoryFilter,
      normalizedSearch,
    ]
  );

  const filteredBillingLogs = useMemo(
    () =>
      filterActivityLogs(
        billingLogs,
        "subscription"
      ),
    [
      billingLogs,
      categoryFilter,
      normalizedSearch,
    ]
  );

  const filteredStaffLogs = useMemo(
    () =>
      filterActivityLogs(
        staffLogs,
        "staff"
      ),
    [
      staffLogs,
      categoryFilter,
      normalizedSearch,
    ]
  );

  const totalResults =
    filteredStaffAttendance.length +
    filteredBranchLogs.length +
    filteredBillingLogs.length +
    filteredStaffLogs.length;

  const changeMonth = (month: MonthName) => {
    setSelectedMonth(month);
    setShowMonthPicker(false);
  };

  const changeYear = (amount: number) => {
    setSelectedYear((current) => current + amount);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(hours / 24);

    if (difference < 0) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (hours < 1) {
      return "Just now";
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#0284C7"
        />

        <Text style={styles.loadingText}>
          Loading monthly activity logs...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color="#EF4444"
          />
        </View>

        <Text style={styles.errorTitle}>
          Logs unavailable
        </Text>

        <Text style={styles.errorDescription}>
          We could not load logs for this month.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#64748B"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, branch, or description..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoCapitalize="none"
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            styles.filterButtonActive,
          ]}
          onPress={() => setShowMonthPicker(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.filterButtonText}>
            {capitalize(selectedMonth)}{" "}
            {selectedYear}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            categoryFilter !== "all" &&
              styles.filterButtonActive,
          ]}
          onPress={() => setShowTypePicker(true)}
        >
          <Ionicons
            name="filter-outline"
            size={18}
            color={
              categoryFilter !== "all"
                ? "#FFFFFF"
                : "#64748B"
            }
          />

          <Text
            style={[
              styles.filterButtonText,
              categoryFilter === "all" &&
                styles.filterButtonTextInactive,
            ]}
          >
            {getCategoryLabel(categoryFilter)}
          </Text>
        </TouchableOpacity>

        {isFetching && (
          <ActivityIndicator
            size="small"
            color="#0284C7"
            style={styles.fetchingIndicator}
          />
        )}
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          {totalResults} result
          {totalResults === 1 ? "" : "s"}
        </Text>

        <TouchableOpacity
          onPress={() => {
            setSearch("");
            setCategoryFilter("all");
          }}
        >
          <Text style={styles.clearText}>
            Clear filters
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.logsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.logsContent
        }
      >
        {(categoryFilter === "all" ||
          categoryFilter === "attendance") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Attendance
            </Text>

            {filteredStaffAttendance.length > 0 ? (
              filteredStaffAttendance.map((staff) => (
                <AttendanceCard
                  key={`${staff.id}-${staff.staffId}`}
                  staff={staff}
                />
              ))
            ) : (
              <Text style={styles.emptySectionText}>
                No attendance data for this month.
              </Text>
            )}
          </View>
        )}

        {(categoryFilter === "all" ||
          categoryFilter === "branch") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Branch activity
            </Text>

            {filteredBranchLogs.length > 0 ? (
              filteredBranchLogs.map((log) => (
                <BranchCard
                  key={log.id}
                  branch={log}
                  formatTimestamp={formatTimestamp}
                />
              ))
            ) : (
              <Text style={styles.emptySectionText}>
                No branch logs for this month.
              </Text>
            )}
          </View>
        )}

        {(categoryFilter === "all" ||
          categoryFilter === "subscription") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Billing activity
            </Text>

            {filteredBillingLogs.length > 0 ? (
              filteredBillingLogs.map((log) => (
                <BillingCard
                  key={log.id}
                  billing={log}
                  formatTimestamp={formatTimestamp}
                />
              ))
            ) : (
              <Text style={styles.emptySectionText}>
                No billing logs for this month.
              </Text>
            )}
          </View>
        )}

        {(categoryFilter === "all" ||
          categoryFilter === "staff") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Staff activity
            </Text>

            {filteredStaffLogs.length > 0 ? (
              filteredStaffLogs.map((log) => (
                <StaffCard
                  key={log.id}
                  staff={log}
                  formatTimestamp={formatTimestamp}
                />
              ))
            ) : (
              <Text style={styles.emptySectionText}>
                No staff logs for this month.
              </Text>
            )}
          </View>
        )}

        {totalResults === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={45}
              color="#94A3B8"
            />

            <Text style={styles.emptyText}>
              No logs match your filters.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowMonthPicker(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select month
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose a month to load its logs
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowMonthPicker(false)
                }
              >
                <Ionicons
                  name="close-outline"
                  size={25}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.yearSelector}>
              <TouchableOpacity
                style={styles.yearButton}
                onPress={() => changeYear(-1)}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color="#0284C7"
                />
              </TouchableOpacity>

              <Text style={styles.yearText}>
                {selectedYear}
              </Text>

              <TouchableOpacity
                style={styles.yearButton}
                onPress={() => changeYear(1)}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#0284C7"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={
                styles.monthList
              }
            >
              {MONTHS.map((month) => (
                <TouchableOpacity
                  key={month.key}
                  style={[
                    styles.monthItem,
                    selectedMonth === month.key &&
                      styles.monthItemActive,
                  ]}
                  onPress={() =>
                    changeMonth(month.key)
                  }
                >
                  <Text
                    style={[
                      styles.monthText,
                      selectedMonth ===
                        month.key &&
                        styles.monthTextActive,
                    ]}
                  >
                    {month.label}
                  </Text>

                  {selectedMonth ===
                    month.key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={19}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowTypePicker(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Filter by type
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose which logs to display
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowTypePicker(false)
                }
              >
                <Ionicons
                  name="close-outline"
                  size={25}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.typeList}>
              {CATEGORIES.map((category) => {
                const active =
                  categoryFilter === category.key;

                return (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.typeItem,
                      active &&
                        styles.typeItemActive,
                    ]}
                    onPress={() => {
                      setCategoryFilter(
                        category.key
                      );
                      setShowTypePicker(false);
                    }}
                  >
                    <Ionicons
                      name={category.icon}
                      size={20}
                      color={
                        active
                          ? "#FFFFFF"
                          : "#64748B"
                      }
                    />

                    <Text
                      style={[
                        styles.typeText,
                        active &&
                          styles.typeTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color="#FFFFFF"
                        style={styles.typeCheck}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= HELPERS ================= */

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function getCategoryLabel(
  category: CategoryFilter
) {
  return (
    CATEGORIES.find(
      (item) => item.key === category
    )?.label || "All Logs"
  );
}

function getBranchLogIcon(
  action: BranchLog["action"]
): keyof typeof Ionicons.glyphMap {
  switch (action) {
    case "BRANCH_CREATED":
      return "add-circle-outline";

    case "BRANCH_SUSPENDED":
      return "close-circle-outline";

    case "BRANCH_ACTIVATED":
      return "checkmark-circle-outline";

    case "BRANCH_UPDATED":
      return "create-outline";

    default:
      return "business-outline";
  }
}

function getBranchLogColor(
  action: BranchLog["action"]
) {
  switch (action) {
    case "BRANCH_CREATED":
      return "#2563EB";

    case "BRANCH_SUSPENDED":
      return "#EF4444";

    case "BRANCH_ACTIVATED":
      return "#16A34A";

    case "BRANCH_UPDATED":
      return "#0284C7";

    default:
      return "#64748B";
  }
}

function getBillingLogIcon(
  action: BillingLog["action"]
): keyof typeof Ionicons.glyphMap {
  switch (action) {
    case "SUBSCRIPTION_RENEWED":
      return "refresh-outline";

    case "PAYMENT_RECEIVED":
      return "checkmark-circle-outline";

    case "PAYMENT_FAILED":
      return "close-circle-outline";

    case "INVOICE_GENERATED":
      return "receipt-outline";

    default:
      return "card-outline";
  }
}

function getBillingLogColor(
  action: BillingLog["action"]
) {
  switch (action) {
    case "SUBSCRIPTION_RENEWED":
    case "PAYMENT_RECEIVED":
      return "#16A34A";

    case "PAYMENT_FAILED":
      return "#EF4444";

    case "INVOICE_GENERATED":
      return "#0284C7";

    default:
      return "#64748B";
  }
}

function getStaffLogIcon(
  action: StaffLog["action"]
): keyof typeof Ionicons.glyphMap {
  switch (action) {
    case "STAFF_ADDED":
      return "person-add-outline";

    case "STAFF_REMOVED":
      return "person-remove-outline";

    case "STAFF_UPDATED":
      return "create-outline";

    case "STAFF_PROMOTED":
      return "trending-up-outline";

    default:
      return "people-outline";
  }
}

function getStaffLogColor(
  action: StaffLog["action"]
) {
  switch (action) {
    case "STAFF_ADDED":
      return "#EC4899";

    case "STAFF_REMOVED":
      return "#EF4444";

    case "STAFF_UPDATED":
      return "#0284C7";

    case "STAFF_PROMOTED":
      return "#F59E0B";

    default:
      return "#64748B";
  }
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 21,
  },

  errorTitle: {
    marginTop: 14,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  errorDescription: {
    maxWidth: 280,
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: "#0284C7",
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 51,
    paddingHorizontal: 15,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
  },

  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: "#0F172A",
    fontSize: 13,
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
    paddingHorizontal: 12,
    gap: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 11,
  },

  filterButtonActive: {
    backgroundColor: "#0284C7",
    borderColor: "#0284C7",
  },

  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  filterButtonTextInactive: {
    color: "#64748B",
  },

  fetchingIndicator: {
    marginLeft: "auto",
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  resultText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },

  clearText: {
    color: "#0284C7",
    fontSize: 11,
    fontWeight: "800",
  },

  logsContainer: {
    flex: 1,
  },

  logsContent: {
    paddingBottom: 40,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    marginBottom: 12,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "900",
  },

  emptySectionText: {
    paddingVertical: 8,
    color: "#94A3B8",
    fontSize: 12,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyText: {
    marginTop: 14,
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },

  modalContent: {
    maxHeight: "85%",
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  modalTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  modalSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
  },

  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 15,
    padding: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 13,
  },

  yearButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  yearText: {
    color: "#0369A1",
    fontSize: 16,
    fontWeight: "900",
  },

  monthList: {
    padding: 20,
    gap: 9,
  },

  monthItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 11,
  },

  monthItemActive: {
    backgroundColor: "#0284C7",
  },

  monthText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },

  monthTextActive: {
    color: "#FFFFFF",
  },

  typeList: {
    padding: 20,
    gap: 10,
  },

  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
  },

  typeItemActive: {
    backgroundColor: "#0284C7",
  },

  typeText: {
    marginLeft: 12,
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },

  typeTextActive: {
    color: "#FFFFFF",
  },

  typeCheck: {
    marginLeft: "auto",
  },
});
