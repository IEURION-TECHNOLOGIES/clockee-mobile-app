import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";

import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "../../../../context/AuthContext";
import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";
import { useBranchStaff } from "@/hooks/useBranchStaff";

import logo from "../../../../assets/images/splash/clockee_logo.png";
import BottomNav from "../../../../components/BottomNav";

type Branch = {
  _id: string;
  name: string;
};

type Staff = {
  _id: string;
  name: string;
  avatar?: string;
};

export default function Overview() {
  const router = useRouter();
  const { logout } = useAuth();

  // All hooks must be called at the top level, unconditionally
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Only call these hooks when we actually have the data
  const institutionId = profile?.institutionId || null;

  const branchesQuery = useInstitutionBranches(institutionId);
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = branchesQuery;

  const activeBranchId = selectedBranchId ?? (branches.length > 0 ? branches[0]._id : null);

  const staffQuery = useBranchStaff(activeBranchId);
  const { data: staff = [], isLoading: staffLoading, error: staffError } = staffQuery;

  const totalStaff = staff.length;

  // Safe logging using useEffect
  useEffect(() => {
    console.log("=== OVERVIEW COMPONENT RENDERED ===");
    console.log("Profile Loading:", profileLoading);
    console.log("Profile Error:", profileError);
    console.log("Profile Data:", profile);
    console.log("Institution ID:", institutionId);
    console.log("Branches Count:", branches.length);
    console.log("Staff Count:", staff.length);
  }, [profileLoading, profileError, profile, institutionId, branches.length, staff.length]);

  /* ================= EARLY RETURNS ================= */

  if (profileLoading) {
    console.log("Showing profile loading screen...");
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  if (profileError || !profile) {
    console.log("Profile not available");
    return (
      <View style={styles.center}>
        <Text>Profile not available</Text>
      </View>
    );
  }

  /* ================= COMPUTED VALUES ================= */

  const getAvatar = () => {
    if (profile?.avatar?.startsWith("http")) return { uri: profile.avatar };
    return logo;
  };


  const currentBranch = useMemo(() => {
    return branches.find((b: Branch) => b._id === activeBranchId);
  }, [branches, activeBranchId]);


  /* ================= UI ================= */

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6", marginTop: 40 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/dashboard/adminDashboard/profile")} style={styles.user}>
            <Image source={getAvatar()} style={styles.avatar} />
            <View>
              <Text style={styles.name}>{profile?.name || "Admin"}</Text>
              <Text style={styles.role}>{profile?.role || "Admin"}</Text>
            </View>
          </TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#000" />
        </View>

        {/* COMPANY / BRANCH */}
        <View style={styles.companyRow}>
          <View style={styles.company}>
            <Ionicons name="briefcase-outline" size={18} color="#0EA5E9" />
            <Text style={styles.companyText}>
              {currentBranch?.name || "No Branch Selected"}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.switch}
            onPress={() => console.log("Switch Branch button pressed")}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Switch</Text>
          </TouchableOpacity>
        </View>

        {/* OVERVIEW SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text>Today</Text>
            <Ionicons name="chevron-down" size={16} />
          </TouchableOpacity>
        </View>

        {/* KPI CARDS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 20 }}
        >
          <KPICard title="Total Staff" value={totalStaff} />
          <KPICard title="Branches" value={branches.length} />
          <KPICard title="Present Today" value="--" />
          <KPICard title="Late Staff" value="--" />
          <KPICard title="Absent" value="--" />
        </ScrollView>

        {/* STAFF LIST */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Staffs</Text>
          <Text style={styles.view}>View all</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
        >
          {staffLoading ? (
            <ActivityIndicator size="small" color="#0EA5E9" />
          ) : (
            staff.map((s: Staff) => (
              <View key={s._id} style={styles.staffItem}>
                <Image
                  source={{
                    uri: s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}`,
                  }}
                  style={styles.staffImg}
                />
                <Text style={styles.staffName}>{s.name}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* QUICK ACTIONS */}
        <Text style={[styles.sectionTitle, { paddingLeft: 20, marginTop: 20 }]}>
          Quick Action
        </Text>

        <View style={styles.quickContainer}>
          <Quick icon="person-add-outline" label="Invite" />
          <Quick icon="person-outline" label="Add Staff" />
          <Quick icon="business-outline" label="Add Branch" />
          <Quick icon="business-outline" label="Department" />
          <Quick icon="create-outline" label="Overrides" />
        </View>

        {/* TODAY'S ATTENDANCE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Attendance</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text>Today</Text>
            <Ionicons name="chevron-down" size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.attCard}>
          <Text style={styles.small}>Total Users</Text>
          <View style={styles.progress}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.attRow}>
            <View>
              <Text style={styles.small}>Work day start</Text>
              <Text style={styles.time}>09:00 AM</Text>
            </View>
            <View>
              <Text style={styles.small}>Clock-in closes in</Text>
              <Text style={[styles.time, { color: "#F97316" }]}>--</Text>
            </View>
          </View>
        </View>

        {/* ATTENDANCE TREND */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attendance trend</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text>This week</Text>
            <Ionicons name="chevron-down" size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.yAxis}>
            <Text style={styles.yLabel}>100%</Text>
            <Text style={styles.yLabel}>75%</Text>
            <Text style={styles.yLabel}>50%</Text>
            <Text style={styles.yLabel}>25%</Text>
            <Text style={styles.yLabel}>0</Text>
          </View>

          <View style={styles.barContainer}>
            <ChartBar height={90} label="Mon" />
            <ChartBar height={100} label="Tue" />
            <ChartBar height={80} label="Wed" />
            <ChartBar height={100} label="Thu" />
            <ChartBar height={95} label="Fri" />
          </View>
        </View>
      </ScrollView>

      <BottomNav role="owner" />
    </View>
  );
}


/* ================= SUB COMPONENTS ================= */

function KPICard({ title, value }: { title: string; value: string | number }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiPercent}>+3.5%</Text>
      <Ionicons name="people" size={32} color="#0EA5E9" />
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
    </View>
  );
}

function Quick({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.quickItem}>
      <View style={styles.quickCircle}>
        <Ionicons name={icon as any} size={22} color="#fff" />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </View>
  );
}

function ChartBar({ height, label }: { height: number; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={[styles.bar, { height }]} />
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },

  user: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 10,
  },

  name: {
    fontWeight: "600",
    fontSize: 16,
  },

  role: {
    color: "#94A3B8",
    fontSize: 12,
  },

  companyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },

  company: {
    flexDirection: "row",
    alignItems: "center",
  },

  companyText: {
    marginLeft: 6,
    color: "#64748B",
  },

  switch: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  dropdown: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },

  kpiCard: {
    backgroundColor: "#fff",
    width: 150,
    padding: 18,
    marginRight: 14,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  kpiPercent: {
    fontSize: 12,
    color: "#10B981",
    marginBottom: 8,
  },

  kpiValue: {
    fontSize: 28,
    fontWeight: "700",
  },

  kpiTitle: {
    color: "#64748B",
  },

  staffItem: {
    alignItems: "center",
    marginRight: 20,
  },

  staffImg: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },

  staffName: {
    marginTop: 6,
    fontSize: 12,
  },

  view: {
    color: "#0EA5E9",
  },

  quickContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#E5E7EB",
    margin: 20,
    borderRadius: 18,
    paddingVertical: 16,
  },

  quickItem: {
    alignItems: "center",
  },

  quickCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  quickLabel: {
    marginTop: 6,
    fontSize: 12,
  },

  attCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },

  small: {
    color: "#94A3B8",
    fontSize: 12,
  },

  progress: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginVertical: 10,
  },

  progressFill: {
    width: "70%",
    height: 6,
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
  },

  attRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  time: {
    fontWeight: "600",
  },

  chartCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  bar: {
    width: 22,
    backgroundColor: "#0EA5E9",
    borderRadius: 6,
  },

  barLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
  },

  yAxis: {
    justifyContent: "space-between",
    marginRight: 10,
    height: 120,
  },

  yLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },

  barContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
});

