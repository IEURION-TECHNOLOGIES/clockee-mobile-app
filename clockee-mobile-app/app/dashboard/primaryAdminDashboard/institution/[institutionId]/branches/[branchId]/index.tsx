import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
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
} from "react-native";

type Staff = {
  id: string;
  name: string;
  role: "Admin" | "Teacher" | "Support";
  status: "active" | "inactive";
};

export default function BranchProfile() {
  const router = useRouter();
  const { institutionId, branchId } =
    useLocalSearchParams<{ institutionId: string; branchId: string }>();

  const [branchStatus, setBranchStatus] =
    useState<"active" | "disabled">("active");

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(20)).current;

  /* ================= MENU CONTROLS ================= */

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
  };

  const handleDeleteBranch = () => {
    router.back();
  };

  /* ================= MOCK STAFF ================= */

  const [staffList] = useState<Staff[]>([
    { id: "1", name: "John Doe", role: "Admin", status: "active" },
    { id: "2", name: "Sarah James", role: "Teacher", status: "active" },
    { id: "3", name: "Michael Lee", role: "Support", status: "inactive" },
    { id: "4", name: "Rita Collins", role: "Teacher", status: "active" },
    { id: "5", name: "Daniel Smart", role: "Support", status: "active" },
    { id: "6", name: "Grace Kelvin", role: "Teacher", status: "active" },
  ]);

  /* ================= ANALYTICS ================= */

  const attendance = {
    totalStaff: staffList.length,
    clockedInToday: 4,
    lateToday: 1,
  };

  const absentToday =
    attendance.totalStaff - attendance.clockedInToday;

  const onTimeRate = useMemo(() => {
    const onTime =
      attendance.clockedInToday - attendance.lateToday;
    return Math.max(
      0,
      Math.round((onTime / attendance.totalStaff) * 100)
    );
  }, [attendance]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <View style={{ width: 22 }} />
      </View>

      {/* ================= PROFILE CARD ================= */}
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
        <Text style={styles.branchName}>Main Campus</Text>
        <Text style={styles.branchMeta}>
          {attendance.totalStaff} Total Staff
        </Text>
      </View>

      {/* ================= ANALYTICS ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Clock-In Overview
        </Text>

        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>
              {attendance.clockedInToday}
            </Text>
            <Text style={styles.analyticsLabel}>
              Clocked In Today
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>
              {attendance.lateToday}
            </Text>
            <Text style={styles.analyticsLabel}>
              Late Today
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>
              {absentToday}
            </Text>
            <Text style={styles.analyticsLabel}>
              Absent Today
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>
              {onTimeRate}%
            </Text>
            <Text style={styles.analyticsLabel}>
              On-Time Rate
            </Text>
          </View>
        </View>
      </View>

      {/* ================= STAFF PREVIEW ================= */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Staff Members
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                `/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/${branchId}/staff/staffList`
              )
            }
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {staffList.slice(0, 4).map((staff) => (
          <TouchableOpacity
            key={staff.id}
            style={styles.staffCard}
              onPress={() =>
              router.push(
                `/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/${branchId}/staff/${staff.id}`
              )
            }
          >
            <View>
              <Text style={styles.staffName}>
                {staff.name}
              </Text>
              <Text style={styles.staffRole}>
                {staff.role}
              </Text>
            </View>

            <View
              style={[
                styles.staffStatus,
                staff.status === "active"
                  ? styles.activeBadge
                  : styles.disabledBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {staff.status.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ================= MODAL MENU ================= */}
      <Modal transparent visible={menuVisible} animationType="none">
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
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeBranchMenu();
                router.push(
                  `/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/${branchId}/edit`
                );
              }}
            >
              <Ionicons name="create-outline" size={18} />
              <Text style={styles.menuText}>
                Edit Branch
              </Text>
            </TouchableOpacity>
            {/* INVITE STAFF */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeBranchMenu();
                router.push({
                  pathname:
                    `/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/${branchId}/staff/invites/inviteOptions`,
                  params: {
                    institutionId,
                    branchId,
                    hasStaff: staffList.length > 0 ? "true" : "false",
                  },
                });
              }}
            >
              <Ionicons name="person-add-outline" size={18} />
              <Text style={styles.menuText}>Invite Staff</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeBranchMenu();
                handleToggleStatus();
              }}
            >
              <Ionicons
                name={
                  branchStatus === "active"
                    ? "pause-outline"
                    : "play-outline"
                }
                size={18}
              />
              <Text style={styles.menuText}>
                {branchStatus === "active"
                  ? "Deactivate Branch"
                  : "Activate Branch"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeBranchMenu();
                handleDeleteBranch();
              }}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color="#DC2626"
              />
              <Text
                style={[
                  styles.menuText,
                  { color: "#DC2626" },
                ]}
              >
                Delete Branch
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
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
    marginBottom: 14,
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0284C7",
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
  staffName: {
    fontSize: 14,
    fontWeight: "700",
  },
  staffRole: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  staffStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
  },
  disabledBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
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