import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useBranchStaff } from "@/hooks/useBranchStaff";
import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";
import { useProfile } from "@/hooks/useProfile";

import BottomNav from "../../../../../components/BottomNav";

export default function MyBranchScreen() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const {
    data: branches = [],
    isLoading: branchesLoading,
  } = useInstitutionBranches(institutionId);

  // ===================== MATCH BRANCH =====================
  const matchedBranch = useMemo(() => {
    if (!profile || branches.length === 0) return null;

    const profileBranchId = profile.branchId;
    if (!profileBranchId) return null;

    const found = branches.find((branch: any) =>
      branch._id === profileBranchId || 
      branch._id?.toString() === profileBranchId?.toString()
    );

    if (found) {
      console.log("✅ Branch matched:", found.name);
      return found;
    }
    console.log("❌ No branch matched");
    return null;
  }, [profile, branches]);

  // ===================== UI STATES =====================
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(20)).current;

  const branch = useMemo(() => matchedBranch || { _id: "", name: "", address: "" }, [matchedBranch]);

  // ===================== STAFF DATA =====================
  const staffQuery = useBranchStaff(branch?._id);
  const { data: staffList = [], refetch, isLoading: staffLoading } = staffQuery;

  const { adminList, staffOnlyList } = useMemo(() => {
    const admins: any[] = [];
    const staffMembers: any[] = [];

    staffList.forEach((member: any) => {
      const roles = Array.isArray(member.role) ? member.role : [member.role].filter(Boolean);
      const isAdmin = roles.some((r: string) => r?.toLowerCase().includes("admin"));

      if (isAdmin) admins.push(member);
      else staffMembers.push(member);
    });

    return { adminList: admins, staffOnlyList: staffMembers };
  }, [staffList]);

  const totalAdmins = adminList.length;
  const totalStaff = staffOnlyList.length;
  const previewAdmins = adminList.slice(0, 5);
  const previewStaff = staffOnlyList.slice(0, 5);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (branch?._id) refetch();
    }, [branch?._id, refetch])
  );

  /* ================= MENU ================= */
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

  const goToAssignStaff = () => {
    closeBranchMenu();
    if (institutionId && branch._id) {
      router.push({
        pathname: "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/staff/invites/inviteOptions",
        params: { institutionId, branchId: branch._id },
      });
    }
  };
  

  const goToEditBranch = () => {
    closeBranchMenu();
    if (institutionId && branch._id) {
      router.push({
        pathname: "/dashboard/adminDashboard/institution/[institutionId]/branches/[branchId]/edit",
        params: { institutionId, branchId: branch._id },
      });
    }
  };

  const renderMainContent = () => {
    if (branchesLoading || profileLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading your branch...</Text>
        </View>
      );
    }

    if (!matchedBranch) {
      return (
        <View style={styles.center}>
          <Ionicons name="business-outline" size={60} color="#CBD5E1" />
          <Text style={styles.noBranchTitle}>No Branch Assigned</Text>
          <Text style={styles.noBranchSubtitle}>
            Branch ID: {profile?.branchId || "Not found"}
          </Text>
        </View>
      );
    }

    return (
      <>
        {/* BRANCH PROFILE CARD */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.cardMenu} onPress={openBranchMenu}>
            <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
          </TouchableOpacity>

          <Ionicons name="business" size={42} color="#0284C7" />
          <Text style={styles.branchName}>{branch.name || "My Branch"}</Text>
          
          {branch.address && <Text style={styles.branchMeta}>{branch.address}</Text>}

          <Text style={styles.branchMeta}>
            {totalAdmins} Admin{totalAdmins !== 1 ? "s" : ""} • {totalStaff} Staff
          </Text>
        </View>

        {/* Admins & Staff Sections (same as before) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admins In Charge</Text>
          {staffLoading ? (
            <ActivityIndicator style={{ marginVertical: 30 }} color="#0284C7" />
          ) : previewAdmins.length > 0 ? (
            previewAdmins.map((admin: any) => (
              <TouchableOpacity key={admin._id} style={styles.adminCard}>
                <Text style={styles.adminName}>{admin.name}</Text>
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No admins assigned yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Members</Text>
          {staffLoading ? (
            <ActivityIndicator style={{ marginVertical: 30 }} color="#0284C7" />
          ) : previewStaff.length > 0 ? (
            previewStaff.map((staff: any) => (
              <View key={staff._id} style={styles.staffCard}>
                <View>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffRole}>
                    {Array.isArray(staff.role) ? staff.role.join(", ") : staff.role || "Staff"}
                  </Text>
                </View>
                <View style={[styles.staffStatus, styles.activeBadge]}>
                  <Text style={styles.statusText}>ACTIVE</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No staff members yet</Text>
            </View>
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Branch</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderMainContent()}
      </ScrollView>

      <BottomNav dashboardType="admin" />

      {/* MENU MODAL */}
      <Modal transparent visible={menuVisible}>
        <Pressable style={styles.overlay} onPress={closeBranchMenu}>
          <Animated.View style={[styles.menuContainer, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.menuItem} onPress={goToAssignStaff}>
              <Ionicons name="person-add-outline" size={20} color="#0F172A" />
              <Text style={styles.menuText}>Assign Staff</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={goToEditBranch}>
              <Ionicons name="create-outline" size={20} color="#0F172A" />
              <Text style={styles.menuText}>Edit Branch</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginLeft: 12 },

  scrollContent: { paddingBottom: 100 },

  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
  },
  cardMenu: { position: "absolute", top: 16, right: 16 },
  branchName: { fontSize: 20, fontWeight: "800", marginTop: 12 },
  branchMeta: { fontSize: 13, color: "#64748B", marginTop: 4 },

  section: { marginTop: 24, marginHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 14 },

  adminCard: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminName: { fontSize: 15, fontWeight: "700" },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adminBadgeText: { fontSize: 11, fontWeight: "800", color: "#0284C7" },

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
  staffRole: { fontSize: 12, color: "#64748B", marginTop: 2 },

  staffStatus: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  activeBadge: { backgroundColor: "#DCFCE7" },
  statusText: { fontSize: 11, fontWeight: "700", color: "#166534" },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { marginTop: 12, color: "#94A3B8", fontSize: 14 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
  },
  loadingText: { marginTop: 16, color: "#64748B", fontSize: 15 },
  noBranchTitle: { marginTop: 20, fontSize: 18, fontWeight: "700", color: "#0F172A" },
  noBranchSubtitle: { marginTop: 8, fontSize: 14, color: "#64748B", textAlign: "center" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-start" },
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
