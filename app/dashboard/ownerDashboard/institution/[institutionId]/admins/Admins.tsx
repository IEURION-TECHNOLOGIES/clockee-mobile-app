// AdminsTab.tsx

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
  getAdminByInstitution,
  demoteToStaff,
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  logoutUser,
} from "@/services/superAdminServices";

import UserActionModal from "@/components/UserActionModal";

/* ================= TYPES ================= */

type Admin = {
  id: string;
  name: string;
  email: string;
  role: "Admin";
  status: "active" | "disabled";
  branch?: string;
};

type FilterType = "all" | "admin" | "active" | "disabled";

/* ================= MAIN ================= */

export default function AdminsTab() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedAdmin, setSelectedAdmin] =
    useState<Admin | null>(null);

  const [showActions, setShowActions] = useState(false);

  /* ================= FETCH ADMINS ================= */

  const fetchAdmins = useCallback(async () => {
    try {
      if (!institutionId) return;

      setLoading(true);

      const response = await getAdminByInstitution(
        institutionId as string
      );

      const data =
        response?.data?.users ||
        response?.data?.data ||
        [];

      console.log(
        "ALL ADMINS FROM API:",
        data.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          email: item.email,
          role: item.role,
          dashboardType: item.dashboardType,
          createdAt: item.createdAt || item.created_at,
          isActive: item.isActive,
        }))
      );

      /*
       * Sort from oldest to newest.
       * The first account is treated as the institution owner
       * and is excluded from the admin list.
       */
      const sortedAdmins = [...data].sort(
        (first: any, second: any) => {
          const firstCreatedAt = new Date(
            first.createdAt ||
              first.created_at ||
              0
          ).getTime();

          const secondCreatedAt = new Date(
            second.createdAt ||
              second.created_at ||
              0
          ).getTime();

          return firstCreatedAt - secondCreatedAt;
        }
      );

      const oldestAdmin = sortedAdmins[0];

      const oldestAdminId =
        oldestAdmin?._id || oldestAdmin?.id;

      console.log("OLDEST ADMIN SELECTED:", {
        id: oldestAdminId,
        name: oldestAdmin?.name,
        email: oldestAdmin?.email,
        role: oldestAdmin?.role,
        dashboardType: oldestAdmin?.dashboardType,
        createdAt:
          oldestAdmin?.createdAt ||
          oldestAdmin?.created_at,
      });

      const adminsOnly = sortedAdmins.filter(
        (item: any) => {
          const currentUserId = item._id || item.id;

          return currentUserId !== oldestAdminId;
        }
      );

      console.log(
        "ADMINS AFTER REMOVING OLDEST:",
        adminsOnly.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          email: item.email,
          role: item.role,
          dashboardType: item.dashboardType,
          createdAt:
            item.createdAt || item.created_at,
        }))
      );

      const formattedAdmins: Admin[] = adminsOnly.map(
        (item: any) => ({
          id: item._id || item.id,
          name: item.name || "Unnamed Admin",
          email: item.email || "",
          role: "Admin",
          status: item.isActive
            ? "active"
            : "disabled",
          branch: item.branch || undefined,
        })
      );

      setAdmins(formattedAdmins);
    } catch (error) {
      console.log("Fetch Admins Error:", error);
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useFocusEffect(
    useCallback(() => {
      fetchAdmins();
    }, [fetchAdmins])
  );

  /* ================= ACTION HANDLERS ================= */

  const handleDemote = async () => {
    if (!selectedAdmin?.id) return;

    return await demoteToStaff(selectedAdmin.id);
  };

  const handleDeactivate = async () => {
    if (!selectedAdmin?.id) return;

    return await deactivateUser(selectedAdmin.id);
  };

  const handleReactivate = async () => {
    if (!selectedAdmin?.id) return;

    return await reactivateUser(selectedAdmin.id);
  };

  const handleResetPassword = async () => {
    if (!selectedAdmin?.id) return;

    return await resetUserPassword(selectedAdmin.id);
  };

  const handleLogout = async () => {
    if (!selectedAdmin?.id) return;

    return await logoutUser(selectedAdmin.id);
  };

  /* ================= FILTER LOGIC ================= */

  const filteredAdmins = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return admins.filter((admin) => {
      const matchesSearch =
        admin.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        admin.email
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        (filter === "admin" &&
          admin.role === "Admin") ||
        (filter === "active" &&
          admin.status === "active") ||
        (filter === "disabled" &&
          admin.status === "disabled");

      return matchesSearch && matchesFilter;
    });
  }, [admins, search, filter]);

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
            <Text style={styles.title}>
              Institution Admins
            </Text>

            <Text style={styles.subtitle}>
              Manage admin access and permissions
            </Text>
          </View>
        </View>

        {/* SEARCH + FILTER */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search"
              size={16}
              color="#64748B"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search admins..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
              >
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
            onPress={() =>
              setShowFilter((previous) => !previous)
            }
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

        {/* FILTER MENU */}
        {showFilter && (
          <View style={styles.filterMenu}>
            {[
              { label: "All", value: "all" },
              { label: "Admins", value: "admin" },
              { label: "Active", value: "active" },
              {
                label: "Disabled",
                value: "disabled",
              },
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
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#7C3AED"
            />
          </View>

          <View>
            <Text style={styles.totalLabel}>
              Total Admins
            </Text>

            <Text style={styles.totalText}>
              {admins.length}
            </Text>
          </View>

          <View style={styles.totalStats}>
            <Text style={styles.totalStatsText}>
              {
                admins.filter(
                  (admin) =>
                    admin.status === "active"
                ).length
              }{" "}
              active
            </Text>
          </View>
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator
              size="large"
              color="#0284C7"
            />

            <Text style={styles.loadingText}>
              Loading admins...
            </Text>
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredAdmins.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="shield-outline"
                size={30}
                color="#7C3AED"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No admins found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or filter.
            </Text>
          </View>
        )}

        {/* ADMIN LIST */}
        {!loading &&
          filteredAdmins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onCardPress={() =>
                router.push({
                  pathname:
                    "/dashboard/ownerDashboard/institution/[institutionId]/admins/[staffId]",
                  params: {
                    institutionId:
                      institutionId as string,
                    staffId: admin.id,
                  },
                })
              }
              onMenuPress={() => {
                setSelectedAdmin(admin);
                setShowActions(true);
              }}
            />
          ))}
      </ScrollView>

      {/* USER ACTION MODAL */}
      <UserActionModal
        visible={showActions}
        role="admin"
        status={
          selectedAdmin?.status === "active"
            ? "active"
            : "inactive"
        }
        onClose={() => {
          setShowActions(false);
          setSelectedAdmin(null);
        }}
        onRefresh={fetchAdmins}
        onDemote={handleDemote}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onResetPassword={handleResetPassword}
        onLogout={handleLogout}
      />
    </View>
  );
}

/* ================= ADMIN CARD ================= */

function AdminCard({
  admin,
  onCardPress,
  onMenuPress,
}: {
  admin: Admin;
  onCardPress: () => void;
  onMenuPress: () => void;
}) {
  const initials = admin.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.adminCard}
      onPress={onCardPress}
      activeOpacity={0.8}
    >
      <View style={styles.adminLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>

        <View style={styles.adminInfo}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {admin.name}
          </Text>

          <Text
            style={styles.email}
            numberOfLines={1}
          >
            {admin.email}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.role}>Admin</Text>

            {admin.branch && (
              <View style={styles.branchBadge}>
                <Ionicons
                  name="location-outline"
                  size={10}
                  color="#64748B"
                />

                <Text style={styles.branchText}>
                  {admin.branch}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.statusBadge,
                admin.status === "active"
                  ? styles.activeBadge
                  : styles.disabledBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  admin.status === "active"
                    ? styles.activeDot
                    : styles.disabledDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  admin.status === "active"
                    ? styles.activeText
                    : styles.disabledText,
                ]}
              >
                {admin.status === "active"
                  ? "Active"
                  : "Disabled"}
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
    backgroundColor: "#EDE9FE",
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
    backgroundColor: "#EDE9FE",
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

  adminCard: {
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

  adminLeft: {
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
    backgroundColor: "#EDE9FE",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#7C3AED",
  },

  adminInfo: {
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  activeDot: {
    backgroundColor: "#16A34A",
  },

  activeText: {
    color: "#166534",
  },

  disabledBadge: {
    backgroundColor: "#FEE2E2",
  },

  disabledDot: {
    backgroundColor: "#DC2626",
  },

  disabledText: {
    color: "#991B1B",
  },
});
