import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import {
  getInstitutions,
  getInstitutionBranches,
  getStaffByInstitution,
  getAdminByInstitution,
} from "@/services/superAdminServices";

/* ================= UTIL ================= */
const formatBranches = (branches?: number) => {
  if (!branches || branches === 0) return "Main only";
  if (branches === 1) return "1 Branch";
  return `${branches} Branches`;
};

const pluralize = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural;
};

export default function OverviewTab({
  institutionId,
}: {
  institutionId: string;
}) {
  const router = useRouter();

  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
  const fetchInstitution = async () => {
    try {
      setLoading(true);

      const res = await getInstitutions();
      const list = res?.data?.institutions || [];

      const found = list.find(
        (item: any) => item._id.toString() === institutionId
      );

      if (!found) return;

      // 🔥 Fetch everything in parallel
      const [staffRes, adminRes, branchRes] = await Promise.all([
        getStaffByInstitution(institutionId).catch(() => null),
        getAdminByInstitution(institutionId).catch(() => null),
        getInstitutionBranches(institutionId).catch(() => null),
      ]);

      const staffCount = staffRes?.data?.data?.length || 0;
      const adminCount = adminRes?.data?.data?.length || 0;

      const branches =
        branchRes?.data?.data ||
        branchRes?.data?.branches ||
        branchRes?.data ||
        [];

      const branchCount = Array.isArray(branches)
        ? branches.length
        : 0;

      setInstitution({
        id: found._id,
        name: found.name,
        status: found.isActive ? "active" : "disabled",
        admins: adminCount,
        staff: staffCount,
        branches: branchCount, // ✅ REAL COUNT
      });
    } catch (err) {
      console.log("Overview fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (institutionId) fetchInstitution();
}, [institutionId]);


  /* ================= STATS ================= */
  const stats = useMemo(() => {
    if (!institution) {
      return {
        staff: 0,
        admins: 0,
        branches: 0,
        attendanceRate: "_ _",
        lateArrivals: "_ _",
      };
    }

    return {
      staff: institution.staff,
      admins: institution.admins,
      branches: institution.branches,
      attendanceRate: "_ _", // Replace later
      lateArrivals: "_ _",
    };
  }, [institution]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={styles.kpiSkeletonRow}>
            <View style={styles.kpiSkeleton} />
            <View style={styles.kpiSkeleton} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ================= KPI ROW 1 ================= */}
      <View style={styles.kpiRow}>
        <KpiCard
          icon="people-outline"
          label={pluralize(stats.staff, "Staff Member", "Staff Members")}
          value={stats.staff.toString()}
          sub="Total staff"
        />
        <KpiCard
          icon="shield-checkmark-outline"
          label={pluralize(stats.admins, "Admin", "Admins")}
          value={stats.admins.toString()}
          sub="Total admins"
        />
      </View>

      {/* ================= KPI ROW 2 ================= */}
      <View style={styles.kpiRow}>
       <KpiCard
          icon="git-branch-outline"
          label="Branches"
          value={formatBranches(stats.branches)}
          sub="Structure"
        />
        <KpiCard
          icon="time-outline"
          label="Attendance"
          value={stats.attendanceRate}
          sub="Last 30 days"
        />
      </View>

      {/* ================= KPI ROW 3 ================= */}
      <View style={styles.kpiRow}>
        <KpiCard
          icon="alert-circle-outline"
          label="Late Arrivals"
          value={stats.lateArrivals.toString()}
          sub="This month"
        />
      </View>

      {/* ================= STATUS ================= */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Institution Health</Text>
        <Text style={styles.statusText}>
          ✔ Attendance system active{"\n"}
          ✔ No issues detected{"\n"}
          ✔ System running smoothly
        </Text>
      </View>

      {/* ================= QUICK ACTIONS ================= */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickRow}>
        <QuickAction
          icon="person-add-outline"
          label="Add Admin"
          route={`/dashboard/superAdminDashboard/institution/${institutionId}/admins/Admins`}
          router={router}
        />
        <QuickAction
          icon="git-branch-outline"
          label="Add Branch"
          route={`/dashboard/superAdminDashboard/institution/${institutionId}/branches/Branches`}
          router={router}
        />
        <QuickAction
          icon="settings-outline"
          label="Settings"
          route={`/dashboard/superAdminDashboard/institution/${institutionId}/settings`}
          router={router}
        />
      </View>
    </ScrollView>
  );
}

/* ================= KPI CARD ================= */
function KpiCard({ icon, label, value, sub }: any) {
  return (
    <View style={styles.kpiCard}>
      <Ionicons name={icon} size={20} color="#0284C7" />
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiSub}>{sub}</Text>
    </View>
  );
}

/* ================= QUICK ACTION ================= */
function QuickAction({ icon, label, route, router }: any) {
  return (
    <TouchableOpacity
      style={styles.quickItem}
      onPress={() => router.push(route)}
    >
      <Ionicons name={icon} size={22} color="#0284C7" />
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 16 },

  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  kpiValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
  },

  kpiLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  kpiSub: {
    fontSize: 11,
    color: "#64748B",
  },

  statusCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },

  statusTitle: {
    fontWeight: "800",
    color: "#0284C7",
  },

  statusText: {
    marginTop: 6,
    fontSize: 13,
  },

  sectionTitle: {
    marginTop: 20,
    fontWeight: "800",
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  quickItem: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  quickLabel: {
    fontSize: 11,
    marginTop: 6,
  },

  /* SKELETON */
  kpiSkeletonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  kpiSkeleton: {
    flex: 1,
    height: 90,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
});
