import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

/* ================= UTIL ================= */
const formatBranches = (branches?: number) => {
  if (!branches || branches === 0) return "Main only";
  if (branches === 1) return "1 Branch";
  return `${branches}`;
};

export default function OverviewTab({
  institutionId,
}: {
  institutionId: string;
}) {
  const router = useRouter();

  // /* ================= MOCK DATA (API LATER) ================= */
  // const institution = {
  //   name: "Greenwood International Academy",
  //   logo: "https://ui-avatars.com/api/?name=Greenwood&background=0284C7&color=fff",
  //   country: "Nigeria",
  //   state: "Lagos",
  //   city: "Ikeja",
  //   timezone: "Africa/Lagos (GMT+1)",
  // };

  const stats = {
    users: 120,
    admins: 5,
    branches: 4,
    attendanceRate: "91%",
    lateArrivals: 34,
  };

  return (
    <ScrollView style={styles.container}>
      {/* ================= PROFILE CARD ================= */}
      {/* <View style={styles.profileCard}>
        <Image source={{ uri: institution.logo }} style={styles.logo} />

        <View style={{ flex: 1 }}>
          <Text style={styles.instName}>{institution.name}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.locationText}>
              {institution.city}, {institution.state}, {institution.country}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.locationText}>
              {institution.timezone}
            </Text>
          </View>
        </View>
      </View> */}

      {/* ================= KPI ROW 1 ================= */}
      <View style={styles.kpiRow}>
        <KpiCard
          icon="people-outline"
          label="Total Staffs"
          value={stats.users.toString()}
          sub="Staffs"
        />
        <KpiCard
          icon="shield-checkmark-outline"
          label="Admins"
          value={stats.admins.toString()}
          sub="Active admins"
        />
      </View>

      {/* ================= KPI ROW 2 ================= */}
      <View style={styles.kpiRow}>
        <KpiCard
          icon="git-branch-outline"
          label="Branches"
          value={formatBranches(stats.branches)}
          sub="Organization structure"
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

      {/* ================= STATUS CARD ================= */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="pulse-outline" size={22} color="#0284C7" />
          <Text style={styles.statusTitle}>Institution Health</Text>
        </View>

        <Text style={styles.statusText}>
          ✔ Attendance system active{"\n"}
          ✔ No security violations{"\n"}
          ✔ All QR points online{"\n"}
          ✔ Branch sync operational
        </Text>
      </View>

      {/* ================= QUICK ACTIONS ================= */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickRow}>
        <QuickAction
          icon="person-add-outline"
          label="Add Admin"
          route={`/dashboard/primaryAdminDashboard/institution/${institutionId}/admins/Admins`}
          router={router}
        />
        <QuickAction
          icon="git-branch-outline"
          label="Add Branch"
          route={`/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/Branches`}
          router={router}
        />
        <QuickAction
          icon="settings-outline"
          label="Settings"
          route={`/dashboard/primaryAdminDashboard/institution/${institutionId}/settings`}
          router={router}
        />
      </View>
    </ScrollView>
  );
}

/* ================= KPI CARD ================= */
function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
}) {
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
function QuickAction({
  icon,
  label,
  route,
  router,
}: {
  icon: any;
  label: string;
  route: string;
  router: any;
}) {
  return (
    <TouchableOpacity
      style={styles.quickItem}
      activeOpacity={0.85}
      onPress={() => router.push(route)}
    >
      <Ionicons name={icon} size={22} color="#0284C7" />
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  container: { padding: 16 },

  /* PROFILE */
  profileCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
  },

  instName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  locationText: {
    fontSize: 12,
    color: "#64748B",
  },

  /* KPI */
  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  kpiValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
    color: "#0F172A",
    textAlign: "center",
  },

  kpiLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    color: "#334155",
  },

  kpiSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },

  /* STATUS */
  statusCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusTitle: {
    fontWeight: "800",
    fontSize: 14,
    color: "#0284C7",
  },

  statusText: {
    marginTop: 10,
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },

  /* QUICK ACTIONS */
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quickItem: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  quickLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    color: "#334155",
  },
});