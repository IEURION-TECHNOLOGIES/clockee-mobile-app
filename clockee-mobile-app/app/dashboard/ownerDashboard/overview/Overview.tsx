import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,  
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useProfile } from "@/hooks/useProfile";
import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";
import { useInstitutionStaff } from "@/hooks/useInstitutionStaff";

import BottomNav from "../../../../components/BottomNav";

const screenWidth = Dimensions.get("window").width;

type Branch = {
  _id: string;
  name: string;
};

type StaffMember = {
  _id: string;
  name: string;
  email?: string;
  branchId?: string;
  role?: string[]; // ✅ ADD THIS
};

export default function OwnerDashboard() {
  const router = useRouter();

const {
  data: profile,
  isLoading: profileLoading,
  error: profileError,
} = useProfile();


  const [refreshing, setRefreshing] = useState(false);

  const [showOverviewDropdown, setShowOverviewDropdown] = useState(false);
  const [overviewRange, setOverviewRange] = useState("Last 30 Days");

  const institutionId = profile?.institutionId ?? undefined;

  /* ================= SAFE FETCH ================= */
 const {
  data: branches = [],
  isLoading: branchesLoading,
  refetch: refetchBranches,
} = useInstitutionBranches(institutionId);

const {
  data: allStaff = [],
  isLoading: staffLoading,
  refetch: refetchStaff,
} = useInstitutionStaff(institutionId);

const {
  data: profileData,
  refetch: refetchProfile,
} = useProfile();



  const { admins, normalStaff, totalAdmins, totalStaff } = useMemo(() => {
  const admins: StaffMember[] = [];
  const normalStaff: StaffMember[] = [];

  allStaff.forEach((staff: StaffMember) => {
    const isAdmin =
      Array.isArray(staff.role) &&
      staff.role.some((r) =>
        r?.toLowerCase().includes("admin")
      );

    if (isAdmin) {
      admins.push(staff);
    } else {
      normalStaff.push(staff);
    }
  });

  return {
    admins,
    normalStaff,
    totalAdmins: admins.length,
    totalStaff: normalStaff.length,
  };
}, [allStaff]);


const recentStaff = useMemo(() => {
  return normalStaff.slice(0, 5);
}, [normalStaff]);


const onRefresh = async () => {
  setRefreshing(true);

  try {
    // If your hooks support refetch, call them here
    await refetchBranches();
    await refetchStaff();
    await refetchProfile();

    // If not, small delay fallback
    // await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.log("Refresh error:", error);
  } finally {
    setRefreshing(false);
  }
};

  // const getBranchName = (branchId?: string) => {
  //   if (!branchId) return "Unassigned";
  //   const branch = branches.find((b: Branch) => b._id === branchId);
  //   return branch?.name || "Unknown Branch";
  // };

  /* ================= LOADING ================= */
  if (profileLoading || branchesLoading || staffLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View style={styles.center}>
        <Text>Profile not available. Please try again.</Text>
      </View>
    );
  }


  type QuickActionCardProps = {
  icon: string;
  label: string;
  route: string;
  gradient: string[];
  onPress: () => void;
};

const QuickActionCard = ({
  icon,
  label,
  gradient,
  onPress,
}: QuickActionCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.premiumCard}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <Ionicons name={icon as any} size={30} color="#fff" />
          <Text style={styles.premiumLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

  return (
    <View style={styles.container}>
     <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0284C7"]}
            tintColor="#0284C7"
          />
        }
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() =>
              router.push("/dashboard/ownerDashboard/profile")
            }
          >
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={50}
                color="#94A3B8"
              />
            )}

            <View>
              <Text style={styles.orgName}>
                {profile.name || "Welcome"}
              </Text>
              <Text style={styles.role}>Owner</Text>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => router.push("/dashboard/ownerDashboard/Notification")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#0F172A"
            />
          </TouchableOpacity> */}
        </View>

        {/* ================= OVERVIEW ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>

          {/* <View style={{ position: "relative" }}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() =>
                setShowOverviewDropdown(!showOverviewDropdown)
              }
            >
              <Text>{overviewRange}</Text>
              <Ionicons
                name={showOverviewDropdown ? "chevron-up" : "chevron-down"}
                size={14}
              />
            </TouchableOpacity>

            {showOverviewDropdown && (
              <View style={styles.dropdownMenu}>
                {["Last 7 Days", "Last 30 Days", "Last 90 Days"].map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setOverviewRange(item);
                        setShowOverviewDropdown(false);
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View> */}
        </View>

        {/* ================= KPI ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiScroll}
        >
          <View style={styles.kpiCard}>
            <Ionicons name="business-outline" size={22} color="#fff" />
            <Text style={styles.kpiNumber}>{branches.length}</Text>
            <Text style={styles.kpiTitle}>Total Branches</Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons name="shield-outline" size={22} color="#fff" />
            <Text style={styles.kpiNumber}>{totalAdmins}</Text>
            <Text style={styles.kpiTitle}>Total Admins</Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons name="people-outline" size={22} color="#fff" />
            <Text style={styles.kpiNumber}>{totalStaff}</Text>
            <Text style={styles.kpiTitle}>Total Staff</Text>
          </View>
        </ScrollView>
        

        {/* ================= BRANCHES ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Branches</Text>
        </View>

        <View style={styles.branchContainer}>
          {branches.length > 0 ? (
            branches.slice(0, 5).map((branch: Branch) => (
              <View key={branch._id} style={styles.branchItem}>
                <View style={styles.branchCircle}>
                  <Text style={styles.branchText}>
                    {branch.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
               <Text
                  style={styles.branchLabel}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {branch.name}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>No branches found</Text>
          )}
        </View>

        {/* ================= RECENT STAFF ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Staff</Text>
          <Text style={styles.muted}>
            {recentStaff.length} of {totalStaff}
          </Text>
        </View>

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.staffScroll}
          >
            {recentStaff.length > 0 ? (
              recentStaff.map((staff) => (
                <View key={staff._id} style={styles.staffCard}>
                  <View style={styles.staffAvatar}>
                    <Ionicons name="person" size={24} color="#64748B" />
                  </View>

                  <Text style={styles.staffName}>{staff.name}</Text>
                  {/* <Text style={styles.staffBranch}>
                    {getBranchName(staff.branchId)}
                  </Text> */}
                </View>
              ))
            ) : (
              <Text style={styles.muted}>No staff found</Text>
            )}
          </ScrollView>

        {/* ================= QUICK ACTIONS ================= */}
        <Text style={styles.quickTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            <QuickActionCard
              icon="people-outline"
              label="Add Staff"
              gradient={["#0EA5E9", "#0284C7"]}
              route="/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]/staff/invites/inviteOptions"
              onPress={() =>
                router.push(
                  "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]/staff/invites/inviteOptions"
                )
              }
            />

            <QuickActionCard
              icon="business-outline"
              label="Create Branch"
              gradient={["#0EA5E9", "#0284C7"]}
              route="/dashboard/ownerDashboard/institution/[institutionId]/branches/create"
              onPress={() =>
                router.push(
                  "/dashboard/ownerDashboard/institution/[institutionId]/branches/create"
                )
              }
            />
          </View>
      </ScrollView>

      <BottomNav dashboardType="owner" />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 40,
  },

  headerLeft: { flexDirection: "row", alignItems: "center" },

  avatar: { width: 44, height: 44, borderRadius: 22 },

  orgName: { fontWeight: "600", fontSize: 16 },
  role: { fontSize: 12, color: "#64748B" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
  },

  sectionTitle: { fontWeight: "600", fontSize: 16 },
  muted: { color: "#64748B" },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },

  dropdownMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 150,
    elevation: 5,
    zIndex: 10,
  },

  dropdownItem: { padding: 12 },

  kpiScroll: { paddingHorizontal: 16, marginTop: 12 },

  kpiCard: {
    width: 180,
    backgroundColor: "#0284C7",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },

  kpiNumber: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: 8 },
  kpiTitle: { color: "#fff", fontWeight: "600", marginTop: 6 },

  branchContainer: {
  flexDirection: "row",
  // justifyContent: "space-between", // 🔥 evenly spread
  // alignItems: "flex-start",
  marginHorizontal: 16,
  marginTop: 12,
},

branchItem: {
  alignItems: "center",
  // flex: 1, // 🔥 each takes equal width
  width: "20%", // 🔥 ensures 5 items per row

},

branchCircle: {
  width: 58,
  height: 58,
  borderRadius: 50,
  backgroundColor: "#0284C7",
  justifyContent: "center",
  alignItems: "center",
},

branchText: {
  color: "#fff",
  fontWeight: "700",
},

  branchLabel: {
  marginTop: 6,
  fontSize: 12,
  textAlign: "center",
  // width: "100%",      // 🔥 keeps layout consistent
},

  staffContainer: { marginHorizontal: 16, marginTop: 12 },

  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  quickTitle: { marginTop: 32, marginLeft: 16, fontWeight: "600" },

  // quickGrid: {
  //   flexDirection: "row",
  //   // flexWrap: "wrap",
  //   marginHorizontal: 16,
  //   marginTop: 12,
  //   gap: 12,
  // },

  quickItem: {
    width: screenWidth / 5 - 16,
    alignItems: "center",
    marginBottom: 20,
  },

  quickLabel: { fontSize: 11, marginTop: 6, textAlign: "center" },
  staffScroll: {
  paddingHorizontal: 10,
  marginTop: 12,
},

staffCard: {
  width: 100,
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 10,
  alignItems: "center",
  marginRight: 12,
  elevation: 5,
},

staffAvatar: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#F1F5F9",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 8,
},

staffName: {
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center",
},

staffBranch: {
  fontSize: 12,
  color: "#64748B",
  marginTop: 4,
  textAlign: "center",
},

quickGrid: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 24,
  marginTop: 30,
},

premiumCard: {
  width: 100,
  height: 80,
  borderRadius: 24,
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 15,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
},

gradientCard: {
  flex: 1,
  borderRadius: 24,
  justifyContent: "center",
  alignItems: "center",
},

premiumLabel: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "600",
  marginTop: 10,
},
});
