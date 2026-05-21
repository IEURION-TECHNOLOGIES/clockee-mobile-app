import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  Animated,
  Easing,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { useBranchStaff } from "@/hooks/useBranchStaff";
import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";

/* ================= TYPES ================= */

type Staff = {
  _id: string;
  name: string;
  role?: string;
  isActive?: boolean;
};

/* ================= MAIN ================= */

export default function BranchProfile() {
  const router = useRouter();

  const { institutionId, branchId } =
    useLocalSearchParams<{
      institutionId: string;
      branchId: string;
    }>();

  /* ================= VALIDATION ================= */

  if (!institutionId || !branchId) {
    return (
      <View style={styles.centered}>
        <Text>Invalid Branch Route</Text>
      </View>
    );
  }

  /* ================= BRANCH FETCH ================= */

  const {
    data: branches = [],
    isLoading: branchesLoading,
  } = useInstitutionBranches(institutionId);

  const branch = branches.find(
    (b: any) => b._id === branchId
  );

  /* ================= STAFF FETCH ================= */

  const {
    data: staffList = [],
    isLoading,
    isFetching,
    refetch,
  } = useBranchStaff(branchId);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  /* ================= BRANCH STATUS (LOCAL UI) ================= */

  const [branchStatus, setBranchStatus] =
    useState<"active" | "disabled">("active");

  /* ================= MENU ================= */

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(20)).current;

  const openBranchMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeBranchMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleToggleStatus = () => {
    setBranchStatus((prev) =>
      prev === "active" ? "disabled" : "active"
    );
    closeBranchMenu();
  };

  const handleDeleteBranch = () => {
    closeBranchMenu();
    router.back();
  };


  

  /* ================= KPI (STATIC FOR NOW) ================= */

  const attendance = {
    totalStaff: staffList.length,
    clockedInToday: 0,
    lateToday: 0,
  };

  const absentToday =
    attendance.totalStaff - attendance.clockedInToday;

  const onTimeRate = useMemo(() => {
    if (attendance.totalStaff === 0) return 0;
    return 0;
  }, [attendance]);


  /* ================= UI ================= */

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={onRefresh}
        />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <View style={{ width: 22 }} />
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.cardMenu}
          onPress={openBranchMenu}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color="#64748B"
          />
        </TouchableOpacity>

        <Ionicons name="business" size={32} color="#0284C7" />

        <Text style={styles.branchName}>
          {branchesLoading
            ? "Loading..."
            : branch?.name || "Unnamed Branch"}
        </Text>

        <Text style={styles.branchMeta}>
          {staffList.length} Staff
        </Text>
      </View>

      {/* ANALYTICS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Clock-In Overview
        </Text>

        <View style={styles.analyticsGrid}>
          <AnalyticsCard
            label="Clocked In Today"
            value={attendance.clockedInToday}
          />
          <AnalyticsCard
            label="Late Today"
            value={attendance.lateToday}
          />
          <AnalyticsCard
            label="Absent Today"
            value={absentToday}
          />
          <AnalyticsCard
            label="On-Time Rate"
            value={`${onTimeRate}%`}
          />
        </View>
      </View>

      {/* STAFF SECTION */}
      <View style={styles.section}>
        <View style={styles.staffHeader}>
          <Text style={styles.sectionTitle}>
            Staff Members
          </Text>

          {staffList.length > 5 && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname:
                    "/dashboard/superAdminDashboard/institution/[institutionId]/branches/[branchId]/staff/staffList",
                  params: { institutionId, branchId },
                })
              }
            >
              <Text style={styles.viewAll}>
                View All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator />
        ) : staffList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="people-outline"
              size={40}
              color="#94A3B8"
            />
            <Text style={styles.emptyText}>
              No staff yet
            </Text>
          </View>
        ) : (
          staffList.slice(0, 5).map((staff: Staff) => {
            const isActive = !!staff.isActive;

            return (
              <TouchableOpacity
                key={staff._id}
                style={styles.staffCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname:
                      "/dashboard/superAdminDashboard/institution/[institutionId]/branches/[branchId]/staff/profile",
                    params: {
                      institutionId,
                      branchId,
                      staff: JSON.stringify(staff),
                    },
                  })
                }
              >
                <View>
                  <Text style={styles.staffName}>
                    {staff.name}
                  </Text>
                <Text style={styles.staffRole}>
                  {Array.isArray(staff.role)
                    ? staff.role.includes("admin")
                      ? "Admin"
                      : "Staff"
                    : staff.role === "admin"
                    ? "Admin"
                    : "Staff"}
                </Text>
                </View>

                <View
                  style={[
                    styles.staffStatus,
                    isActive
                      ? styles.activeBadge
                      : styles.disabledBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      !isActive && { color: "#991B1B" },
                    ]}
                  >
                    {isActive ? "ACTIVE" : "DISABLED"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* MENU MODAL */}
      <Modal transparent visible={menuVisible}>
        <Pressable
          style={styles.overlay}
          onPress={closeBranchMenu}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <MenuItem
              icon="person-add-outline"
              label="Assign Staff"
              onPress={() => {
                closeBranchMenu();
                router.push({
                  pathname:
                    "/dashboard/superAdminDashboard/institution/[institutionId]/branches/[branchId]/staff/invites/inviteOptions",
                  params: { institutionId, branchId },
                });
              }}
            />

            <MenuItem
              icon="create-outline"
              label="Edit Branch"
              onPress={() => {
                closeBranchMenu();
                router.push({
                  pathname:
                    "/dashboard/superAdminDashboard/institution/[institutionId]/branches/[branchId]/edit",
                  params: { institutionId, branchId },
                });
              }}
            />

            <MenuItem
              icon={
                branchStatus === "active"
                  ? "pause-outline"
                  : "play-outline"
              }
              label={
                branchStatus === "active"
                  ? "Deactivate Branch"
                  : "Activate Branch"
              }
              onPress={handleToggleStatus}
            />

            <MenuItem
              icon="trash-outline"
              label="Delete Branch"
              color="#DC2626"
              onPress={handleDeleteBranch}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

/* ================= SMALL COMPONENTS ================= */

const AnalyticsCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.analyticsCard}>
    <Text style={styles.analyticsNumber}>
      {value}
    </Text>
    <Text style={styles.analyticsLabel}>
      {label}
    </Text>
  </View>
);

const MenuItem = ({
  icon,
  label,
  onPress,
  color,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={18}
      color={color || "#111"}
    />
    <Text
      style={[
        styles.menuText,
        color && { color },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    marginTop: 40,
  },

  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
  },

  branchName: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },

  branchMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  staffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  viewAll: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
    textDecorationLine: "underline",
  },

  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },

  analyticsCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  analyticsNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0284C7",
  },

  analyticsLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },

  staffCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  staffName: { fontSize: 14, fontWeight: "700" },
  staffRole: { fontSize: 12, color: "#64748B", marginTop: 4 },

  staffStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  activeBadge: { backgroundColor: "#DCFCE7" },
  disabledBadge: { backgroundColor: "#FEE2E2" },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
  },

  emptyBox: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },

  cardMenu: {
    position: "absolute",
    top: 14,
    right: 14,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
  },

  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 140,
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 10,
    elevation: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  menuText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

