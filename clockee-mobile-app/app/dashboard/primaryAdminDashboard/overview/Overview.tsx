import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import BottomNav from "../../../../components/BottomNav";

const screenWidth = Dimensions.get("window").width;

export default function PrimaryAdminDashboard() {
  const router = useRouter();

  const [showOverviewDropdown, setShowOverviewDropdown] =
    React.useState(false);

  const [overviewRange, setOverviewRange] =
    React.useState("Last 30 Days");

  /* ===== MOCK USER DATA (FRONTEND ONLY) ===== */

  const user = {
    name: "Greenwood Limited",
    role: "Super Admin",
    avatar: "https://i.pravatar.cc/100",
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />

            <View>
              <Text style={styles.orgName}>{user.name}</Text>
              <Text style={styles.role}>{user.role}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("./Notification")}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>
        </View>

        {/* ================= OVERVIEW ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>

          <View style={{ position: "relative" }}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() =>
                setShowOverviewDropdown(!showOverviewDropdown)
              }
            >
              <Text>{overviewRange}</Text>

              <Ionicons
                name={
                  showOverviewDropdown
                    ? "chevron-up"
                    : "chevron-down"
                }
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
                      <Text style={styles.dropdownItemText}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View>
        </View>

        {/* ================= KPI CARDS ================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiScroll}
        >
          <View style={styles.kpiCard}>
            <Ionicons name="business-outline" size={22} color="#fff" />
            <Text style={styles.kpiNumber}>5</Text>
            <Text style={styles.kpiTitle}>Total Branches</Text>
            <Text style={styles.kpiSub}>
              4 Active, 1 Suspended
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons name="people-outline" size={22} color="#fff" />
            <Text style={styles.kpiNumber}>12,000</Text>
            <Text style={styles.kpiTitle}>Total Users</Text>
            <Text style={styles.kpiSub}>
              1,200 Staff, 10,800 Students
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons name="time-outline" size={22} color="#fff" />
            <Text style={styles.kpiNumber}>92%</Text>
            <Text style={styles.kpiTitle}>Attendance Rate</Text>
            <Text style={styles.kpiSub}>Last 30 Days</Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#fff"
            />
            <Text style={styles.kpiNumber}>320</Text>
            <Text style={styles.kpiTitle}>Late Arrivals</Text>
            <Text style={styles.kpiSub}>
              Across All Branches
            </Text>
          </View>
        </ScrollView>

        {/* ================= BRANCHES ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Branches</Text>
          <Text style={styles.muted}>5 Branches</Text>
        </View>

        <View style={styles.branchesRow}>
          {[
            { l: "Ikeja", n: "IK", c: "#991B1B" },
            { l: "Ajegunle", n: "AJ", c: "#F97316" },
            { l: "Ogudu", n: "OG", c: "#16A34A" },
            { l: "Maryland", n: "MA", c: "#2563EB" },
            { l: "Yaba", n: "YA", c: "#0EA5E9" },
          ].map((b) => (
            <View key={b.l} style={styles.branchItem}>
              <View
                style={[
                  styles.branchCircle,
                  { backgroundColor: b.c },
                ]}
              >
                <Text style={styles.branchText}>{b.n}</Text>
              </View>

              <Text style={styles.branchLabel}>{b.l}</Text>
            </View>
          ))}
        </View>

        {/* ================= QUICK ACTION ================= */}

        <Text style={styles.quickTitle}>Quick Action</Text>

        <View style={styles.quickGrid}>
          {[
            {
              icon: "person-add-outline",
              label: "Manual Invite",
              route: "/invites/manual",
            },
            {
              icon: "person-outline",
              label: "Invite",
              route: "/dashboard/primaryAdminDashboard/InviteOne",
            },
            {
              icon: "time-outline",
              label: "Attendance",
              route: "/attendance",
            },
            {
              icon: "qr-code-outline",
              label: "Qr Codes",
              route: "/qr-codes",
            },
            {
              icon: "ellipsis-horizontal",
              label: "More",
              route: "/more",
            },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickItem}
              activeOpacity={0.7}
              onPress={() => router.push(q.route as any)}
            >
              <Ionicons
                name={q.icon as any}
                size={22}
                color="#0284C7"
              />

              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= ATTENDANCE OVERVIEW ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Attendance overview
          </Text>

          <View style={styles.dropdown}>
            <Text>Last 30 Days</Text>
            <Ionicons name="chevron-down" size={14} />
          </View>
        </View>

        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            datasets: [
              { data: [6000, 12000, 8000, 2500, 8000] },
              {
                data: [200, 300, 1200, 800, 300],
                color: () => "#F97316",
              },
            ],
            legend: ["Clock-ins", "Late Arrivals"],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#F8FAFC",
            backgroundGradientTo: "#F8FAFC",
            color: () => "#0284C7",
            labelColor: () => "#64748B",
            decimalPlaces: 0,
          }}
          bezier
          style={styles.chart}
        />

        {/* ================= BRANCH COMPARISON ================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Branch comparison
          </Text>

          <View style={styles.dropdown}>
            <Text>Last 30 Days</Text>
            <Ionicons name="chevron-down" size={14} />
          </View>
        </View>

        {[
          { name: "Ikeja", w: "95%" },
          { name: "Ajegunle", w: "85%" },
          { name: "Ogudu", w: "88%" },
          { name: "Maryland", w: "92%" },
          { name: "Yaba", w: "90%" },
        ].map((b) => (
          <View key={b.name} style={styles.progressRow}>
            <Text>{b.name}</Text>

            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: b.w as any }]}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ================= BOTTOM NAV ================= */}

      <BottomNav role="owner"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 40,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: { width: 40, height: 40, borderRadius: 20 },

  orgName: { fontWeight: "600", fontSize: 14 },

  role: { fontSize: 12, color: "#64748B" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 20,
  },

  sectionTitle: { fontWeight: "600", fontSize: 16 },

  muted: { color: "#64748B" },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },

  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 140,
    elevation: 4,
    zIndex: 10,
  },

  dropdownItem: { padding: 10 },

  dropdownItemText: { fontSize: 13 },

  kpiScroll: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
  },

  kpiCard: {
    width: 220,
    backgroundColor: "#0284C7",
    borderRadius: 8,
    padding: 16,
  },

  kpiNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },

  kpiTitle: {
    color: "#fff",
    marginTop: 6,
    fontWeight: "600",
  },

  kpiSub: { color: "#E0F2FE", fontSize: 12 },

  branchesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
  },

  branchItem: { alignItems: "center" },

  branchCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  branchText: { color: "#fff", fontWeight: "700" },

  branchLabel: { marginTop: 6, fontSize: 12 },

  quickTitle: {
    marginTop: 24,
    marginLeft: 16,
    fontWeight: "600",
    fontSize: 16,
  },

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
  },

  quickItem: {
    alignItems: "center",
    width: 64,
  },

  quickLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },

  chart: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
  },

  progressRow: {
    marginHorizontal: 16,
    marginTop: 10,
  },

  progressBar: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },

  progressFill: {
    height: 10,
    backgroundColor: "#0284C7",
    borderRadius: 10,
  },
});