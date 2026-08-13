import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, {
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import {
  BranchStaffApiMember,
  useBranchStaff,
} from "@/hooks/useBranchStaff";

import logo from "@/assets/images/splash/clockee_logo.png";

/* ================= COLORS ================= */

const PRIMARY = "#0093DD";
const PRIMARY_SOFT = "#EAF8FE";
const PRIMARY_BORDER = "#B8E7F8";

/* ================= TYPES ================= */

type StaffFilter =
  | "all"
  | "active"
  | "inactive"
  | "teacher"
  | "admin"
  | "support";

type StaffAction =
  | "ACTIVATE"
  | "DEACTIVATE"
  | "RESET"
  | "REMOVE";

type StaffProps = {
  institutionId?: string;
  branchId?: string;
  branchName?: string;
};

type StaffMember = BranchStaffApiMember;

/* ================= SCREEN ================= */

export default function Staff({
  institutionId: institutionIdProp,
  branchId: branchIdProp,
  branchName: branchNameProp,
}: StaffProps) {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    initialized: authInitialized,
  } = useAuth();

  const params = useLocalSearchParams<{
    institutionId?: string | string[];
    branchId?: string | string[];
    branchName?: string | string[];
  }>();

  const routeInstitutionId =
    getParam(params.institutionId);

  const routeBranchId =
    getParam(params.branchId);

  const routeBranchName =
    getParam(params.branchName);

  const institutionId =
    institutionIdProp ||
    routeInstitutionId ||
    user?.institutionId ||
    undefined;

  const branchId =
    branchIdProp ||
    routeBranchId ||
    user?.branchId ||
    undefined;

  const branchName =
    branchNameProp ||
    routeBranchName ||
    "My Branch";

  const [searchText, setSearchText] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<StaffFilter>("all");

  const [showFilter, setShowFilter] =
    useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);

  const [showActions, setShowActions] =
    useState(false);

  const [confirmAction, setConfirmAction] =
    useState<StaffAction | null>(null);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [notice, setNotice] =
    useState<string | null>(null);

  const {
    data: apiStaff = [],
    isLoading: staffLoading,
    isFetching,
    error,
    refetch,
  } = useBranchStaff(branchId);

  const staffOnly = useMemo(() => {
    return apiStaff.filter((member) => {
      const currentUser =
        member._id === user?.id;

      const admin =
        hasAdminRole(member);

      const excluded =
        currentUser || admin;

      console.log(
        "[Staff] Filtering member:",
        {
          id: member._id,
          name: member.name,
          role: member.role,
          roles: member.roles,
          currentUser,
          admin,
          included: !excluded,
        }
      );

      return !excluded;
    });
  }, [apiStaff, user?.id]);

  const activeStaffCount =
    staffOnly.filter(
      (member) => isActive(member)
    ).length;

  const inactiveStaffCount =
    staffOnly.length - activeStaffCount;

  const filteredStaff = useMemo(() => {
    const search =
      searchText.trim().toLowerCase();

    return staffOnly.filter((member) => {
      const active =
        isActive(member);

      const role =
        getStaffRole(member)
          .toLowerCase();

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "active" &&
          active) ||
        (activeFilter === "inactive" &&
          !active) ||
        (activeFilter === "teacher" &&
          role.includes("teacher")) ||
        (activeFilter === "admin" &&
          hasAdminRole(member)) ||
        (activeFilter === "support" &&
          role.includes("support"));

      const matchesSearch =
        !search ||
        member.name
          ?.toLowerCase()
          .includes(search) ||
        member.email
          ?.toLowerCase()
          .includes(search) ||
        member.departmentOrUnit
          ?.toLowerCase()
          .includes(search) ||
        role.includes(search);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [
    staffOnly,
    searchText,
    activeFilter,
  ]);

  const goToCreateStaff = () => {
    if (!institutionId || !branchId) {
      setNotice(
        "Institution ID or branch ID is missing."
      );

      return;
    }

    router.push({
      pathname:
        "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/create",
      params: {
        institutionId,
        branchId,
      },
    });
  };

  const goToStaffDetails = (
    member: StaffMember
  ) => {
    if (!institutionId || !branchId) {
      setNotice(
        "Institution ID or branch ID is missing."
      );

      return;
    }

    router.push({
      pathname:
        "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/[staffId]",
      params: {
        institutionId,
        branchId,
        staffId: member._id,
        staff: JSON.stringify(member),
      },
    });
  };

  const openStaffActions = (
    member: StaffMember
  ) => {
    setSelectedStaff(member);
    setShowActions(true);
  };

  const requestAction = (
    action: StaffAction
  ) => {
    setConfirmAction(action);
    setShowActions(false);
    setShowConfirm(true);
  };

  const handleConfirmAction = () => {
    if (!selectedStaff || !confirmAction) {
      return;
    }

    /*
     * These are currently UI notices.
     *
     * Replace them with real mutation services
     * when your backend action endpoints are ready.
     */
    console.log(
      "[Staff] Action requested:",
      {
        action: confirmAction,
        staffId: selectedStaff._id,
        branchId,
      }
    );

    const actionText =
      confirmAction === "ACTIVATE"
        ? "activation"
        : confirmAction === "DEACTIVATE"
          ? "deactivation"
          : confirmAction === "RESET"
            ? "password reset"
            : "removal";

    setShowConfirm(false);
    setConfirmAction(null);
    setSelectedStaff(null);

    setNotice(
      `Staff ${actionText} requested.`
    );
  };

  if (
    authLoading ||
    !authInitialized
  ) {
    return (
      <LoadingState message="Loading account..." />
    );
  }

  if (!user) {
    return (
      <ErrorState
        title="Account unavailable"
        message="Please log in again to continue."
      />
    );
  }

  if (!branchId) {
    return (
      <ErrorState
        title="Branch ID missing"
        message="We could not identify the branch to load staff."
      />
    );
  }

  if (staffLoading) {
    return (
      <LoadingState
        message="Loading branch staff..."
        branchId={branchId}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Staff unavailable"
        message={
          error.message ||
          "We could not load staff for this branch."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEyebrow}>
              BRANCH TEAM
            </Text>

            <Text style={styles.headerTitle}>
              Staff members
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={goToCreateStaff}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.branchContext}>
          <View style={styles.branchContextIcon}>
            <Ionicons
              name="business-outline"
              size={18}
              color={PRIMARY}
            />
          </View>

          <View style={styles.branchContextText}>
            <Text style={styles.branchContextLabel}>
              CURRENT BRANCH
            </Text>

            <Text
              style={styles.branchContextName}
              numberOfLines={1}
            >
              {branchName}
            </Text>
          </View>

          {isFetching && (
            <ActivityIndicator
              size="small"
              color={PRIMARY}
            />
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* KPI HEADER */}

        <View style={styles.kpiHeader}>
          <View style={styles.kpiHeaderTitleRow}>
            <View>
              <Text style={styles.kpiHeaderTitle}>
                Team overview
              </Text>

              <Text
                style={styles.kpiHeaderSubtitle}
              >
                Admin accounts are excluded
              </Text>
            </View>

            <Ionicons
              name="analytics-outline"
              size={24}
              color={PRIMARY}
            />
          </View>

          <View style={styles.kpiGrid}>
            <KpiCard
              title="Total"
              value={staffOnly.length}
              icon="people-outline"
              color={PRIMARY}
              background={PRIMARY_SOFT}
            />

            <KpiCard
              title="Active"
              value={activeStaffCount}
              icon="checkmark-circle-outline"
              color="#047857"
              background="#ECFDF5"
            />

            <KpiCard
              title="Inactive"
              value={inactiveStaffCount}
              icon="pause-circle-outline"
              color="#B45309"
              background="#FFFBEB"
            />
          </View>
        </View>

        {/* SEARCH */}

        <View style={styles.searchFilterRow}>
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search-outline"
              size={17}
              color="#64748B"
            />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search staff..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {searchText.length > 0 && (
              <Pressable
                onPress={() => setSearchText("")}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color="#94A3B8"
                />
              </Pressable>
            )}
          </View>

          <View>
            <Pressable
              style={styles.filterBtn}
              onPress={() =>
                setShowFilter(
                  (previous) => !previous
                )
              }
            >
              <Ionicons
                name="filter-outline"
                size={16}
                color={PRIMARY}
              />

              <Text style={styles.filterLabel}>
                {activeFilter.toUpperCase()}
              </Text>
            </Pressable>

            {showFilter && (
              <View style={styles.dropdown}>
                {FILTERS.map((item) => (
                  <Pressable
                    key={item.key}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setActiveFilter(
                        item.key
                      );
                      setShowFilter(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        activeFilter ===
                          item.key &&
                          styles.dropdownTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* LIST HEADER */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Branch staff
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              {filteredStaff.length} member
              {filteredStaff.length === 1
                ? ""
                : "s"} shown
            </Text>
          </View>

          <Ionicons
            name="people-circle-outline"
            size={25}
            color={PRIMARY}
          />
        </View>

        {/* STAFF LIST */}

        <View style={styles.staffListCard}>
          {filteredStaff.length > 0 ? (
            filteredStaff.map((member) => (
              <Pressable
                key={member._id}
                style={styles.staffRow}
                onPress={() =>
                  goToStaffDetails(member)
                }
              >
                <StaffAvatar member={member} />

                <View style={styles.staffContent}>
                  <Text
                    style={styles.staffName}
                    numberOfLines={1}
                  >
                    {member.name}
                  </Text>

                  <Text
                    style={styles.staffEmail}
                    numberOfLines={1}
                  >
                    {member.email ||
                      "No email available"}
                  </Text>

                  <Text
                    style={styles.staffDepartment}
                    numberOfLines={1}
                  >
                    {getStaffRole(member)}
                  </Text>
                </View>

                <View style={styles.staffRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      isActive(member)
                        ? styles.statusBadgeActive
                        : styles.statusBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isActive(member)
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {isActive(member)
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      openStaffActions(member)
                    }
                    hitSlop={8}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={18}
                      color="#64748B"
                    />
                  </Pressable>
                </View>
              </Pressable>
            ))
          ) : (
            <EmptyState
              hasFilter={
                searchText.length > 0 ||
                activeFilter !== "all"
              }
              onClear={() => {
                setSearchText("");
                setActiveFilter("all");
              }}
              onAddStaff={goToCreateStaff}
            />
          )}
        </View>

        {/* ADD STAFF */}

        <Pressable
          style={styles.addStaffCard}
          onPress={goToCreateStaff}
        >
          <View style={styles.addStaffIcon}>
            <Ionicons
              name="person-add-outline"
              size={21}
              color={PRIMARY}
            />
          </View>

          <View style={styles.addStaffContent}>
            <Text style={styles.addStaffTitle}>
              Add staff member
            </Text>

            <Text
              style={styles.addStaffSubtitle}
            >
              Create and assign a new staff account.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#94A3B8"
          />
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNav dashboardType="admin" />

      {notice && (
        <Pressable
          style={styles.notice}
          onPress={() => setNotice(null)}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.noticeText}>
            {notice}
          </Text>
        </Pressable>
      )}

      {/* ACTION SHEET */}

      {showActions && (
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() =>
              setShowActions(false)
            }
          />

          <View style={styles.actionSheet}>
            <Text style={styles.sheetTitle}>
              {selectedStaff?.name}
            </Text>

            {selectedStaff &&
            isActive(selectedStaff) ? (
              <ActionItem
                label="Deactivate"
                onPress={() =>
                  requestAction("DEACTIVATE")
                }
              />
            ) : (
              <ActionItem
                label="Activate"
                onPress={() =>
                  requestAction("ACTIVATE")
                }
              />
            )}

            <ActionItem
              label="Reset password"
              onPress={() =>
                requestAction("RESET")
              }
            />

            <ActionItem
              label="Remove staff"
              danger
              onPress={() =>
                requestAction("REMOVE")
              }
            />

            <Pressable
              style={styles.cancelButton}
              onPress={() =>
                setShowActions(false)
              }
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* CONFIRM DIALOG */}

      {showConfirm && (
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() =>
              setShowConfirm(false)
            }
          />

          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Confirm action
            </Text>

            <Text style={styles.confirmMessage}>
              Are you sure you want to{" "}
              {formatAction(confirmAction)}{" "}
              {selectedStaff?.name}?
            </Text>

            <View style={styles.confirmRow}>
              <Pressable
                onPress={() =>
                  setShowConfirm(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.confirmBtn}
                onPress={handleConfirmAction}
              >
                <Text
                  style={styles.confirmBtnText}
                >
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/* ================= FILTERS ================= */

const FILTERS: {
  key: StaffFilter;
  label: string;
}[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "teacher",
    label: "Teachers",
  },
  {
    key: "admin",
    label: "Administration",
  },
  {
    key: "support",
    label: "Support",
  },
  {
    key: "active",
    label: "Active",
  },
  {
    key: "inactive",
    label: "Inactive",
  },
];

/* ================= COMPONENTS ================= */

function KpiCard({
  title,
  value,
  icon,
  color,
  background,
}: {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View
        style={[
          styles.kpiIcon,
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

      <Text style={styles.kpiValue}>
        {value}
      </Text>

      <Text style={styles.kpiTitle}>
        {title}
      </Text>
    </View>
  );
}

function StaffAvatar({
  member,
}: {
  member: StaffMember;
}) {
  const source =
    member.avatar &&
    member.avatar.startsWith("http")
      ? { uri: member.avatar }
      : logo;

  return (
    <Image
      source={source}
      style={styles.staffAvatar}
    />
  );
}

function ActionItem({
  label,
  danger = false,
  onPress,
}: {
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.actionItem}
      onPress={onPress}
    >
      <Text
        style={[
          styles.actionText,
          danger && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyState({
  hasFilter,
  onClear,
  onAddStaff,
}: {
  hasFilter: boolean;
  onClear: () => void;
  onAddStaff: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            hasFilter
              ? "search-outline"
              : "people-outline"
          }
          size={28}
          color="#94A3B8"
        />
      </View>

      <Text style={styles.emptyTitle}>
        {hasFilter
          ? "No matching staff"
          : "No staff members"}
      </Text>

      <Text style={styles.emptyDescription}>
        {hasFilter
          ? "Try a different search or filter."
          : "Staff assigned to this branch will appear here."}
      </Text>

      {hasFilter && (
        <Pressable
          style={styles.clearFilterButton}
          onPress={onClear}
        >
          <Text style={styles.clearFilterText}>
            Clear filters
          </Text>
        </Pressable>
      )}

      <Pressable
        style={styles.emptyAddButton}
        onPress={onAddStaff}
      >
        <Ionicons
          name="person-add-outline"
          size={17}
          color="#FFFFFF"
        />

        <Text style={styles.emptyAddText}>
          Add staff member
        </Text>
      </Pressable>
    </View>
  );
}

function LoadingState({
  message,
  branchId,
}: {
  message: string;
  branchId?: string;
}) {
  return (
    <View style={styles.center}>
      <ActivityIndicator
        size="large"
        color={PRIMARY}
      />

      <Text style={styles.loadingText}>
        {message}
      </Text>

      {branchId && (
        <Text style={styles.debugText}>
          Branch ID: {branchId}
        </Text>
      )}
    </View>
  );
}

function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Ionicons
        name="alert-circle-outline"
        size={44}
        color="#DC2626"
      />

      <Text style={styles.errorTitle}>
        {title}
      </Text>

      <Text style={styles.errorMessage}>
        {message}
      </Text>

      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>
            Try again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ================= HELPERS ================= */

function getParam(
  value?: string | string[]
) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isActive(
  member: StaffMember
) {
  return (
    !member.status ||
    member.status.toLowerCase() ===
      "active"
  );
}

function hasAdminRole(
  member: StaffMember
) {
  const roles = [
    ...(Array.isArray(member.role)
      ? member.role
      : member.role
        ? [member.role]
        : []),

    ...(Array.isArray(member.roles)
      ? member.roles
      : []),
  ].map((role) =>
    role.toLowerCase().trim()
  );

  return (
    roles.includes("admin") ||
    roles.includes("super_admin") ||
    roles.includes("owner")
  );
}

function getStaffRole(
  member: StaffMember
) {
  const roles = [
    ...(Array.isArray(member.role)
      ? member.role
      : member.role
        ? [member.role]
        : []),

    ...(Array.isArray(member.roles)
      ? member.roles
      : []),
  ];

  if (
    roles.some(
      (role) =>
        role.toLowerCase() ===
        "teacher"
    )
  ) {
    return member.subject
      ? `Teacher · ${member.subject}`
      : "Teacher";
  }

  if (
    roles.some(
      (role) =>
        role.toLowerCase() ===
        "support"
    )
  ) {
    return "Support";
  }

  if (hasAdminRole(member)) {
    return "Administration";
  }

  return roles[0] || "Staff";
}

function formatAction(
  action: StaffAction | null
) {
  switch (action) {
    case "ACTIVATE":
      return "activate";

    case "DEACTIVATE":
      return "deactivate";

    case "RESET":
      return "reset the password of";

    case "REMOVE":
      return "remove";

    default:
      return "modify";
  }
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    marginTop: 40,
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

  debugText: {
    marginTop: 7,
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
  },

  errorTitle: {
    marginTop: 14,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  errorMessage: {
    maxWidth: 280,
    marginTop: 7,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: PRIMARY,
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  header: {
    paddingTop: 30,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 11,
  },

  headerEyebrow: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerTitle: {
    marginTop: 3,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
  },

  addButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    borderRadius: 14,
  },

  branchContext: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    padding: 12,
    backgroundColor: PRIMARY_SOFT,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: 15,
  },

  branchContextIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D8F2FC",
    borderRadius: 11,
  },

  branchContextText: {
    flex: 1,
    marginLeft: 9,
  },

  branchContextLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  branchContextName: {
    marginTop: 3,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "900",
  },

  scrollContent: {
    paddingTop: 16,
    paddingBottom: 125,
  },

  kpiHeader: {
    marginHorizontal: 18,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    elevation: 2,
  },

  kpiHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  kpiHeaderTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },

  kpiHeaderSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  kpiGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  kpiCard: {
    width: "31.5%",
    minHeight: 91,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
  },

  kpiIcon: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderRadius: 10,
  },

  kpiValue: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "900",
  },

  kpiTitle: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 18,
    marginTop: 16,
  },

  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#0F172A",
    fontSize: 13,
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
  },

  filterLabel: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: "800",
  },

  dropdown: {
    position: "absolute",
    top: 54,
    right: 0,
    zIndex: 20,
    width: 180,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 5,
  },

  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  dropdownText: {
    color: "#334155",
    fontSize: 12,
  },

  dropdownTextActive: {
    color: PRIMARY,
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 11,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
  },

  staffListCard: {
    marginHorizontal: 18,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 19,
  },

  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 84,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  staffAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
  },

  staffContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  staffName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  staffEmail: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  staffDepartment: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 10,
  },

  staffRight: {
    alignItems: "flex-end",
  },

  statusBadge: {
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusBadgeActive: {
    backgroundColor: "#ECFDF5",
  },

  statusBadgeInactive: {
    backgroundColor: "#FFF7ED",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  statusTextActive: {
    color: "#047857",
  },

  statusTextInactive: {
    color: "#C2410C",
  },

  addStaffCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 15,
    padding: 14,
    backgroundColor: PRIMARY_SOFT,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: 17,
  },

  addStaffIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D8F2FC",
    borderRadius: 12,
  },

  addStaffContent: {
    flex: 1,
    marginLeft: 10,
  },

  addStaffTitle: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "900",
  },

  addStaffSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 190,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 53,
    height: 53,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 17,
  },

  emptyTitle: {
    marginTop: 10,
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyDescription: {
    maxWidth: 260,
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },

  clearFilterButton: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: PRIMARY_SOFT,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: 10,
  },

  clearFilterText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "800",
  },

  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: PRIMARY,
    borderRadius: 999,
  },

  emptyAddText: {
    marginLeft: 6,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 50,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.42)",
  },

  actionSheet: {
    padding: 22,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  sheetTitle: {
    marginBottom: 12,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  actionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  actionText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },

  dangerText: {
    color: "#DC2626",
  },

  cancelButton: {
    alignItems: "center",
    marginTop: 15,
    paddingVertical: 10,
  },

  cancelText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800",
  },

  confirmBox: {
    margin: 24,
    padding: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
  },

  confirmTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },

  confirmMessage: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
  },

  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: PRIMARY,
    borderRadius: 10,
  },

  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  notice: {
    position: "absolute",
    right: 18,
    bottom: 90,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    elevation: 5,
  },

  noticeText: {
    flex: 1,
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 12,
  },

  bottomSpace: {
    height: 25,
  },
});
