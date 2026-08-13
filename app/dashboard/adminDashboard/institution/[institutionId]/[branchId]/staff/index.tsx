// staff.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useBranchStaff } from "@/hooks/useBranchStaff";

import logo from "@/assets/images/splash/clockee_logo.png";

/* ================= COLORS ================= */

const PRIMARY = "#0093DD";
const PRIMARY_LIGHT = "#32AFE7";
const PRIMARY_SOFT = "#EAF8FE";
const PRIMARY_BORDER = "#B8E7F8";

/* ================= TYPES ================= */

type StaffFilter =
  | "all"
  | "active"
  | "inactive";

type StaffAttendance = {
  status?: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
};

type StaffMember = {
  _id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  departmentOrUnit?: string | null;
  role?: string[];
  branchId?: string;
  status?: string;
  todayAttendance?: StaffAttendance | null;
};

type StaffProps = {
  institutionId?: string;
  branchId?: string;
  branchName?: string;
};

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

  const [searchText, setSearchText] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<StaffFilter>("all");

  const institutionId =
    institutionIdProp ||
    user?.institutionId ||
    undefined;

  const realBranchId =
    branchIdProp ||
    user?.branchId ||
    undefined;

  const displayBranchName =
    branchNameProp || "My Branch";

  console.log(
    "[Staff] Resolved data:",
    {
      userId: user?.id,
      institutionId,
      realBranchId,
      displayBranchName,
    }
  );

  const {
    data: response = [],
    isLoading: staffLoading,
    isFetching,
    error,
    refetch,
  } = useBranchStaff(realBranchId);

  const rawStaff: StaffMember[] =
    Array.isArray(response)
      ? response
      : Array.isArray(
          (response as any)?.data
        )
        ? (response as any).data
        : Array.isArray(
            (response as any)?.data?.staff
          )
          ? (response as any).data.staff
          : [];

  /*
   * The admin is normally not returned in the
   * branch staff list, but this prevents the
   * authenticated admin from appearing twice
   * if the backend includes the admin.
   */
  const adminId =
    user?.id || undefined;

  const branchStaff = useMemo(() => {
    return rawStaff.filter(
      (member) => member._id !== adminId
    );
  }, [rawStaff, adminId]);

  const activeStaffCount =
    branchStaff.filter(isStaffActive).length;

  const inactiveStaffCount =
    branchStaff.length - activeStaffCount;

  const filteredStaff = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return branchStaff.filter((member) => {
      const active = isStaffActive(member);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "active" &&
          active) ||
        (activeFilter === "inactive" &&
          !active);

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
          .includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [
    branchStaff,
    searchText,
    activeFilter,
  ]);

  const goToCreateStaff = () => {
    if (!institutionId || !realBranchId) {
      console.warn(
        "[Staff] Cannot create staff. Missing IDs:",
        {
          institutionId,
          branchId: realBranchId,
        }
      );

      return;
    }

    router.push({
      pathname:
        "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/create",
      params: {
        institutionId,
        branchId: realBranchId,
      },
    });
  };

  const goToStaffDetails = (
    member: StaffMember
  ) => {
    if (!institutionId || !realBranchId) {
      console.warn(
        "[Staff] Cannot open details. Missing IDs:",
        {
          institutionId,
          branchId: realBranchId,
          staffId: member._id,
        }
      );

      return;
    }

    router.push({
      pathname:
        "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/[staffId]",
      params: {
        institutionId,
        branchId: realBranchId,
        staffId: member._id,
        staff: JSON.stringify(member),
      },
    });
  };

  if (
    authLoading ||
    !authInitialized
  ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={PRIMARY}
        />

        <Text style={styles.loadingText}>
          Loading account...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconLarge}>
          <Ionicons
            name="person-outline"
            size={31}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Account unavailable
        </Text>

        <Text style={styles.errorMessage}>
          Please log in again to continue.
        </Text>
      </View>
    );
  }

  if (!realBranchId) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconLarge}>
          <Ionicons
            name="business-outline"
            size={31}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Branch ID missing
        </Text>

        <Text style={styles.errorMessage}>
          We could not identify the branch to load staff.
        </Text>

        <Text style={styles.debugText}>
          User ID: {user.id}
        </Text>
      </View>
    );
  }

  if (staffLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={PRIMARY}
        />

        <Text style={styles.loadingText}>
          Loading branch staff...
        </Text>

        <Text style={styles.debugText}>
          Branch ID: {realBranchId}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconLarge}>
          <Ionicons
            name="people-outline"
            size={31}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Staff unavailable
        </Text>

        <Text style={styles.errorMessage}>
          {error.message ||
            "We could not load staff for this branch."}
        </Text>

        <Text style={styles.debugText}>
          Branch ID: {realBranchId}
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
    );
  }

  return (
    <View style={styles.screen}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEyebrow}>
              BRANCH TEAM
            </Text>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
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

        {/* Only branch context appears here.
            Staff totals are shown in the KPI section. */}

        {/* <View style={styles.branchContext}>
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
              {displayBranchName}
            </Text>
          </View>

          {isFetching && (
            <ActivityIndicator
              size="small"
              color={PRIMARY}
            />
          )}
        </View> */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ================= KPI HEADER ================= */}

        <View style={styles.kpiHeader}>
          <View style={styles.kpiHeaderTitleRow}>
            <View>
              <Text style={styles.kpiHeaderTitle}>
                Team overview
              </Text>

              <Text
                style={styles.kpiHeaderSubtitle}
              >
                Staff status for this branch
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
              label="Total"
              value={branchStaff.length}
              icon="people-outline"
              color={PRIMARY}
              background={PRIMARY_SOFT}
            />

            <KpiCard
              label="Active"
              value={activeStaffCount}
              icon="checkmark-circle-outline"
              color="#047857"
              background="#ECFDF5"
            />

            <KpiCard
              label="Inactive"
              value={inactiveStaffCount}
              icon="pause-circle-outline"
              color="#B45309"
              background="#FFFBEB"
            />
          </View>
        </View>

        {/* ================= SEARCH ================= */}

        <View style={styles.searchWrapper}>
          <View style={styles.searchIcon}>
            <Ionicons
              name="search-outline"
              size={19}
              color={PRIMARY}
            />
          </View>

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search staff or department..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchText.length > 0 && (
            <Pressable
              style={styles.clearButton}
              onPress={() => setSearchText("")}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* ================= FILTERS ================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <FilterButton
            label={`All (${branchStaff.length})`}
            active={activeFilter === "all"}
            onPress={() =>
              setActiveFilter("all")
            }
          />

          <FilterButton
            label={`Active (${activeStaffCount})`}
            active={activeFilter === "active"}
            onPress={() =>
              setActiveFilter("active")
            }
          />

          <FilterButton
            label={`Inactive (${inactiveStaffCount})`}
            active={activeFilter === "inactive"}
            onPress={() =>
              setActiveFilter("inactive")
            }
          />
        </ScrollView>

        {/* ================= LIST HEADER ================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Branch staff
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              {filteredStaff.length} staff member
              {filteredStaff.length !== 1
                ? "s"
                : ""}{" "}
              shown
            </Text>
          </View>

          <Ionicons
            name="people-circle-outline"
            size={24}
            color={PRIMARY}
          />
        </View>

        {/* ================= STAFF LIST ================= */}

        <View style={styles.staffListCard}>
          {filteredStaff.length > 0 ? (
            filteredStaff.map((member) => (
              <StaffRow
                key={member._id}
                member={member}
                onPress={() =>
                  goToStaffDetails(member)
                }
              />
            ))
          ) : (
            <EmptyState
              searchText={searchText}
              filter={activeFilter}
              onClear={() => {
                setSearchText("");
                setActiveFilter("all");
              }}
              onAddStaff={goToCreateStaff}
            />
          )}
        </View>

        {/* ================= ADD STAFF ================= */}

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

            <Text style={styles.addStaffSubtitle}>
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
    </View>
  );
}

/* ================= KPI CARD ================= */

function KpiCard({
  label,
  value,
  icon,
  color,
  background,
}: {
  label: string;
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

      <Text style={styles.kpiLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ================= FILTER BUTTON ================= */

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.filterButton,
        active && styles.filterButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          active && styles.filterTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ================= STAFF ROW ================= */

function StaffRow({
  member,
  onPress,
}: {
  member: StaffMember;
  onPress: () => void;
}) {
  const avatarSource =
    member.avatar &&
    member.avatar.startsWith("http")
      ? { uri: member.avatar }
      : logo;

  const active = isStaffActive(member);

  const department =
    member.departmentOrUnit ||
    "No department";

  return (
    <Pressable
      style={styles.staffRow}
      onPress={onPress}
    >
      <Image
        source={avatarSource}
        style={styles.staffAvatar}
      />

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
          {member.email || "No email available"}
        </Text>

        <View style={styles.staffMetaRow}>
          <View style={styles.departmentBadge}>
            <Ionicons
              name="briefcase-outline"
              size={11}
              color="#64748B"
            />

            <Text
              style={styles.departmentText}
              numberOfLines={1}
            >
              {department}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.staffRight}>
        <View
          style={[
            styles.statusBadge,
            active
              ? styles.statusBadgeActive
              : styles.statusBadgeInactive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              active
                ? styles.statusDotActive
                : styles.statusDotInactive,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              active
                ? styles.statusTextActive
                : styles.statusTextInactive,
            ]}
          >
            {active ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={17}
          color="#94A3B8"
        />
      </View>
    </Pressable>
  );
}

/* ================= EMPTY STATE ================= */

function EmptyState({
  searchText,
  filter,
  onClear,
  onAddStaff,
}: {
  searchText: string;
  filter: StaffFilter;
  onClear: () => void;
  onAddStaff: () => void;
}) {
  const hasFilter =
    searchText.length > 0 ||
    filter !== "all";

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            hasFilter
              ? "search-outline"
              : "people-outline"
          }
          size={27}
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
          size={18}
          color="#FFFFFF"
        />

        <Text style={styles.emptyAddText}>
          Add staff member
        </Text>
      </Pressable>
    </View>
  );
}

/* ================= HELPERS ================= */

function isStaffActive(
  member: StaffMember
) {
  return (
    !member.status ||
    member.status.toLowerCase() === "active"
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
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
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  debugText: {
    marginTop: 6,
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
  },

  emptyIconLarge: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_SOFT,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: 20,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 19,
    paddingVertical: 10,
    backgroundColor: PRIMARY,
    borderRadius: 10,
  },

  retryButtonText: {
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

  kpiLabel: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    marginHorizontal: 18,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
  },

  searchIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 11,
  },

  searchInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
  },

  clearButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  filters: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 11,
  },

  filterButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  filterText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 18,
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

  staffMetaRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  departmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 7,
  },

  departmentText: {
    maxWidth: 105,
    marginLeft: 4,
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
  },

  staffRight: {
    alignItems: "flex-end",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 6,
    borderRadius: 8,
  },

  statusBadgeActive: {
    backgroundColor: "#ECFDF5",
  },

  statusBadgeInactive: {
    backgroundColor: "#FFF7ED",
  },

  statusDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 4,
  },

  statusDotActive: {
    backgroundColor: "#10B981",
  },

  statusDotInactive: {
    backgroundColor: "#F97316",
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
    justifyContent: "center",
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

  bottomSpace: {
    height: 20,
  },
});
