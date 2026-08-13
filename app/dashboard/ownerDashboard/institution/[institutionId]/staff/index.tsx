import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getStaffByInstitution,
  promoteToAdmin,
  deactivateUser,
  reactivateUser,
} from "@/services/superAdminServices";

import UserActionModal from "@/components/UserActionModal";

/* ================= TYPES ================= */

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "Staff";
  status: "active" | "disabled";
  branch?: string;
};


type FilterType =
  | "all"
  | "staff"
  | "active"
  | "disabled";


  const hasAdminRole = (
  role: string | string[] | undefined
): boolean => {
  if (!role) {
    return false;
  }

  const roles = Array.isArray(role)
    ? role
    : [role];

  return roles
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim().toLowerCase())
    .includes("admin");
};

/* ================= MAIN ================= */

export default function StaffTab() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);

  const [showActions, setShowActions] = useState(false);

  /* ================= FETCH STAFF ================= */

  const fetchStaff = useCallback(async () => {
  try {
    if (!institutionId) return;

    setLoading(true);

    const response = await getStaffByInstitution(
      institutionId as string
    );

    const data =
      response?.data?.users ||
      response?.data?.data ||
      [];

    /*
     * Remove every user that has admin in their role.
     * This includes:
     *
     * "admin"
     * "staff, admin"
     * "admin, staff"
     * ["staff", "admin"]
     */
    const staffOnly = data.filter(
      (item: any) => !hasAdminRole(item.role)
    );

    const formattedStaff: StaffMember[] =
      staffOnly.map((item: any) => ({
        id: item._id || item.id,
        name: item.name || "Unnamed User",
        email: item.email || "",
        role: "Staff",
        status: item.isActive
          ? "active"
          : "disabled",
        branch: item.branch || undefined,
      }));

    console.log("ALL USERS:", data);
    console.log("STAFF ONLY:", formattedStaff);

    setStaff(formattedStaff);
  } catch (error) {
    console.log("Fetch Staff Error:", error);
  } finally {
    setLoading(false);
  }
}, [institutionId]);


  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [fetchStaff])
  );

  /* ================= ACTION HANDLERS ================= */

  const handlePromote = async () => {
    if (!selectedStaff?.id) return;

    return await promoteToAdmin(selectedStaff.id);
  };

  const handleDeactivate = async () => {
    if (!selectedStaff?.id) return;

    return await deactivateUser(selectedStaff.id);
  };

  const handleReactivate = async () => {
    if (!selectedStaff?.id) return;

    return await reactivateUser(selectedStaff.id);
  };

  // const handleResetPassword = async () => {
  //   if (!selectedStaff?.id) return;

  //   return await resetUserPassword(selectedStaff.id);
  // };

  // const handleLogout = async () => {
  //   if (!selectedStaff?.id) return;

  //   return await logoutUser(selectedStaff.id);
  // };

  /* ================= FILTER LOGIC ================= */

  const filteredStaff = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return staff.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        (filter === "staff" && member.role === "Staff") ||
        (filter === "active" && member.status === "active") ||
        (filter === "disabled" && member.status === "disabled");

      return matchesSearch && matchesFilter;
    });
  }, [staff, search, filter]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Institution Staff</Text>
            <Text style={styles.subtitle}>
              Manage staff members and access
            </Text>
          </View>
        </View>

        {/* SEARCH + FILTER */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={16} color="#64748B" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search staff..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilter((previous) => !previous)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="filter-outline"
              size={16}
              color="#0284C7"
            />

            <Text style={styles.filterLabel}>
              {filter.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FILTER OPTIONS */}
        {showFilter && (
          <View style={styles.filterMenu}>
            {[
              { label: "All", value: "all" },
              { label: "Staff", value: "staff" },
              { label: "Active", value: "active" },
              { label: "Disabled", value: "disabled" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.filterOption}
                onPress={() => {
                  setFilter(option.value as FilterType);
                  setShowFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filter === option.value &&
                      styles.selectedFilterText,
                  ]}
                >
                  {option.label}
                </Text>

                {filter === option.value && (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color="#0284C7"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TOTAL */}
        <View style={styles.totalWrapper}>
          <View style={styles.totalIcon}>
            <Ionicons name="people-outline" size={19} color="#0284C7" />
          </View>

          <View>
            <Text style={styles.totalLabel}>Total Staff</Text>
            <Text style={styles.totalText}>{staff.length}</Text>
          </View>

          <View style={styles.totalStats}>
            <Text style={styles.totalStatsText}>
              {staff.filter((member) => member.status === "active").length} active
            </Text>
          </View>
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredStaff.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={30}
                color="#0284C7"
              />
            </View>

            <Text style={styles.emptyTitle}>No staff found</Text>

            <Text style={styles.emptyText}>
              Try another search or filter.
            </Text>
          </View>
        )}

        {/* STAFF LIST */}
        {!loading &&
          filteredStaff.map((member) => (
            <StaffCard
              key={member.id}
              staff={member}
              onCardPress={() =>
                router.push({
                  pathname:
                    "/dashboard/ownerDashboard/institution/[institutionId]/staff/[staffId]",
                  params: {
                    institutionId: institutionId as string,
                    staffId: member.id,
                  },
                })
              }
              onMenuPress={() => {
                setSelectedStaff(member);
                setShowActions(true);
              }}
            />
          ))}
      </ScrollView>

      {/* USER ACTION MODAL */}
      <UserActionModal
        visible={showActions}
        role="staff"
        status={
          selectedStaff?.status === "active"
            ? "active"
            : "inactive"
        }
        onClose={() => {
          setShowActions(false);
          setSelectedStaff(null);
        }}
        onRefresh={fetchStaff}
        onPromote={handlePromote}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        // onResetPassword={handleResetPassword}
        // onLogout={handleLogout}
      />
    </View>
  );
}

/* ================= STAFF CARD ================= */

function StaffCard({
  staff,
  onCardPress,
  onMenuPress,
}: {
  staff: StaffMember;
  onCardPress: () => void;
  onMenuPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.staffCard}
      onPress={onCardPress}
      activeOpacity={0.8}
    >
      <View style={styles.staffLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {staff.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.staffInfo}>
          <Text style={styles.name}>{staff.name}</Text>
          <Text style={styles.email}>{staff.email}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.role}>{staff.role}</Text>

            {staff.branch && (
              <View style={styles.branchBadge}>
                <Ionicons
                  name="location-outline"
                  size={10}
                  color="#64748B"
                />

                <Text style={styles.branchText}>
                  {staff.branch}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.statusBadge,
                staff.status === "active"
                  ? styles.activeBadge
                  : styles.disabledBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  staff.status === "active"
                    ? styles.activeText
                    : styles.disabledText,
                ]}
              >
                {staff.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onMenuPress}
        hitSlop={10}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-forward"
          size={17}
          color="#94A3B8"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  searchWrapper: {
    flex: 1,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0F172A",
  },

  filterBtn: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 14,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  filterLabel: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "800",
    color: "#0284C7",
  },

  filterMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 9,
  },

  filterOptionText: {
    fontSize: 13,
    color: "#475569",
  },

  selectedFilterText: {
    color: "#0284C7",
    fontWeight: "800",
  },

  totalWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 13,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  totalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    marginRight: 10,
  },

  totalLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  totalText: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  totalStats: {
    flex: 1,
    alignItems: "flex-end",
  },

  totalStatsText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 3,
  },

  loadingWrapper: {
    alignItems: "center",
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
  },

  staffCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  staffLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0284C7",
  },

  staffInfo: {
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },

  email: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  role: {
    fontSize: 11,
    color: "#64748B",
    marginRight: 7,
  },

  branchBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },

  branchText: {
    maxWidth: 100,
    marginLeft: 3,
    fontSize: 10,
    color: "#64748B",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  activeText: {
    color: "#166534",
  },

  disabledBadge: {
    backgroundColor: "#FEE2E2",
  },

  disabledText: {
    color: "#991B1B",
  },
});
