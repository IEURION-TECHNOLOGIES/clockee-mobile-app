import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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
} from "react-native";

import { useBranchStaff } from "@/hooks/useBranchStaff";

export default function BranchProfile() {
  const router = useRouter();
  const { institutionId, branchId, branch: branchParam } =
    useLocalSearchParams<{
      institutionId: string;
      branchId: string;
      branch?: string;
    }>();

  const [menuVisible, setMenuVisible] = useState(false);
  const [branchStatus, setBranchStatus] =
    useState<"active" | "disabled">("active");
  const slideAnim = useRef(new Animated.Value(20)).current;

  /* ================= PARSE BRANCH ================= */
  const branch = useMemo(() => {
    if (branchParam) {
      try {
        return JSON.parse(branchParam);
      } catch (e) {
        console.error("Failed to parse branch data");
      }
    }
    return { _id: branchId, name: "Branch", address: "" };
  }, [branchParam, branchId]);

  /* ================= FETCH STAFF ================= */
  const staffQuery = useBranchStaff(branchId);
  const { data: staffList = [], refetch } = staffQuery;

  /* ================= SPLIT ADMINS & STAFF ================= */
  const { adminList, staffOnlyList } = useMemo(() => {
    const admins: any[] = [];
    const staffMembers: any[] = [];

    staffList.forEach((member: any) => {
      const roles = Array.isArray(member.role)
        ? member.role
        : [member.role].filter(Boolean);

      const isAdmin = roles.some((r: string) =>
        r?.toLowerCase().includes("admin")
      );

      if (isAdmin) {
        admins.push(member);
      } else {
        staffMembers.push(member);
      }
    });

    return { adminList: admins, staffOnlyList: staffMembers };
  }, [staffList]);

  const totalAdmins = adminList.length;
  const totalStaff = staffOnlyList.length;

  const previewAdmins = adminList.slice(0, 5);
  const previewStaff = staffOnlyList.slice(0, 5);

  const showViewAllAdmins = adminList.length > 5;
  const showViewAllStaff = staffOnlyList.length > 5;

  /* ================= REFRESH ON FOCUS ================= */
  useFocusEffect(
    useCallback(() => {
      if (branchId) {
        refetch();
      }
    }, [branchId, refetch])
  );

  /* ================= KPI CALCULATIONS ================= */
  const clockedInToday = Math.floor(totalStaff * 0.78);
  const lateToday = Math.floor(totalStaff * 0.12);
  const absentToday = totalStaff - clockedInToday;
  const onTimeRate =
    totalStaff > 0
      ? Math.round(((clockedInToday - lateToday) / totalStaff) * 100)
      : 0;

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
    closeBranchMenu();
  };

  const handleDeleteBranch = () => {
    closeBranchMenu();
    alert("Delete branch functionality coming soon");
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.cardMenu}
          onPress={openBranchMenu}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>

        <Ionicons name="business" size={42} color="#0284C7" />
        <Text style={styles.branchName}>{branch.name}</Text>
        {branch.address && (
          <Text style={styles.branchMeta}>
            {branch.address}
          </Text>
        )}
        <Text style={styles.branchMeta}>
          {totalAdmins} Admin • {totalStaff} Staff
        </Text>
      </View>

      {/* ADMINS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Admins In Charge
        </Text>

        {previewAdmins.length > 0 ? (
          previewAdmins.map((admin: any) => (
              <TouchableOpacity
                key={admin._id} style={styles.adminCard}
                onPress={() =>
                  router.push({
                    pathname:
                      "/dashboard/ownerDashboard/institution/[institutionId]/admins/[staffId]",
                    params: {
                      institutionId: institutionId!,
                      staffId: admin._id,
                    },
                  })
                }
              >
                
                <Text style={styles.adminName}>
                  {admin.name}
                </Text>
                {/* <Text style={styles.adminRole}>
                  {Array.isArray(admin.role)
                    ? admin.role.join(", ")
                    : admin.role || "Admin"}
                </Text> */}
              

              <View style={styles.adminBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color="#0284C7"
                />
                <Text style={styles.adminBadgeText}>
                  ADMIN
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="shield-outline"
              size={40}
              color="#CBD5E1"
            />
            <Text style={styles.emptyText}>
              No admins assigned
            </Text>
          </View>
        )}
      </View>

      {/* STAFF SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Staff Members
        </Text>

        {previewStaff.length > 0 ? (
          previewStaff.map((staff: any) => (
            <TouchableOpacity
              key={staff._id}
              style={styles.staffCard}
              onPress={() =>
                router.push({
                  pathname:
                    "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]/staff/[staffId]",
                  params: {
                    institutionId: institutionId!,
                    branchId: branchId!,
                    staffId: staff._id,
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
                    ? staff.role.join(", ")
                    : staff.role || "Staff"}
                </Text>
              </View>

              <View
                style={[
                  styles.staffStatus,
                  (staff.status || "active") ===
                  "active"
                    ? styles.activeBadge
                    : styles.disabledBadge,
                ]}
              >
                <Text style={styles.statusText}>
                  {(staff.status || "active").toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={40}
              color="#CBD5E1"
            />
            <Text style={styles.emptyText}>
              No staff members yet
            </Text>
          </View>
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


            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeBranchMenu();
                router.push({
                  pathname: `/dashboard/ownerDashboard/institution/${institutionId}/branches/${branchId}/staff/invites/inviteOptions`,
                  params: { institutionId, branchId },
                });
              }}
            >
              <Ionicons name="person-add-outline" size={20} color="#0F172A" />
              <Text style={styles.menuText}>Assign Staff</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeBranchMenu();
                router.push(
                  `/dashboard/ownerDashboard/institution/${institutionId}/branches/${branchId}/edit`
                );
              }}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#0F172A"
              />
              <Text style={styles.menuText}>
                Edit Branch
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={handleToggleStatus}
            >
              <Ionicons
                name={
                  branchStatus === "active"
                    ? "pause-outline"
                    : "play-outline"
                }
                size={20}
                color="#0F172A"
              />
              <Text style={styles.menuText}>
                {branchStatus === "active"
                  ? "Deactivate Branch"
                  : "Activate Branch"}
              </Text>
            </TouchableOpacity> */}

            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteBranch}
            >
              <Ionicons
                name="trash-outline"
                size={20}
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
            </TouchableOpacity> */}
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
    paddingHorizontal: 16,
    paddingTop: 20,
    marginTop: 40,
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
  },
  cardMenu: { position: "absolute", top: 16, right: 16 },
  branchName: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },
  branchMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  section: { marginTop: 24, marginHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 14,
  },
  adminCard: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  adminName: { fontSize: 15, fontWeight: "700" },
  adminRole: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: "800",
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
  staffName: { fontSize: 15, fontWeight: "600" },
  staffRole: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  staffStatus: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeBadge: { backgroundColor: "#DCFCE7" },
  disabledBadge: { backgroundColor: "#FEE2E2" },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 110,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuText: { fontSize: 15, fontWeight: "600" },
});
