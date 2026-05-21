import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import logo from "../../../../assets/images/splash/clockee_logo.png";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../../context/AuthContext";
import { LineChart } from "react-native-chart-kit";

import { useInstitutions } from "@/hooks/useInstitutions";
import BottomNav from "../../../../components/BottomNav";
// import ClockLoader from "../../../../components/ClockLoader";
import ResponseModal from "../../../../components/ResponseModal";


const screenWidth = Dimensions.get("window").width;

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: institutions = [], isLoading, isError, refetch } = useInstitutions();

  
  const [overviewRange, setOverviewRange] = useState("30");
  const [showOverviewDropdown, setShowOverviewDropdown] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "info">("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");



 // 🔥 THEN your early return
  if (isError) {
    return (
      <View style={styles.centerLoader}>
        <Text style={{ color: "#EF4444" }}>
          Failed to load institutions
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: "#0284C7", marginTop: 10 }}>
            Tap to Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

  const getInitials = (name?: string) => {
  if (!name) return "NA";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};

const getAvatar = () => {
  if (user?.avatar?.startsWith("http")) return { uri: user.avatar };
  return logo;
};

  // ================= DERIVED =================
  const latestInstitutions = useMemo(() => {
    return institutions
      .slice()
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime()
      )
      .slice(0, 5);
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
  const cutoff = getDaysAgo(Number(overviewRange));
  return institutions.filter(inst => new Date(inst.createdAt) >= cutoff);
}, [institutions, overviewRange]);


  const firstInstitution = latestInstitutions[0];
// Then calculate KPIs based on filteredInstitutions
const totalInstitutions = filteredInstitutions.length;
const activeInstitutions = filteredInstitutions.filter(i => i.status === "active").length;
const disabledInstitutions = filteredInstitutions.filter(i => i.status === "disabled").length;

  // ================= CHART =================
  const chartData = useMemo(() => {
    const count = overviewRange === "7" ? 7 : overviewRange === "30" ? 5 : 9;

    const labels = Array.from({ length: count }, (_, i) => `D${i + 1}`);
    const clockIns = labels.map(() => Math.floor(Math.random() * 10000));
    const late = labels.map(() => Math.floor(Math.random() * 1000));
    
    return { labels, clockIns, late };
  }, [overviewRange]);

  // ================= COMPARISON =================
  const comparisonData = useMemo(() => {
    return latestInstitutions.map((inst) => ({
      name: inst?.name || "Unnamed",
      percent: Math.floor(Math.random() * 40) + 60,
    }));
  }, [latestInstitutions]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/dashboard/superAdminDashboard/profile")} style={styles.headerLeft}>
            <Image source={getAvatar()} style={styles.avatar} />
            <View>
              <Text style={styles.orgName}>{user?.name || "Welcome"}</Text>
              <Text style={styles.role}>{user?.role ? "Super Admin" : "No role"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/dashboard/superAdminDashboard/Notification")}
          >
            <Ionicons name="notifications-outline" size={22} />
          </TouchableOpacity>
        </View>

        {/* OVERVIEW */}
        {/* OVERVIEW */}
<View style={[styles.sectionHeader, { zIndex: 10 }]}>
  <Text style={styles.sectionTitle}>Overview</Text>

  <TouchableOpacity
    style={styles.dropdown}
    onPress={() => setShowOverviewDropdown(!showOverviewDropdown)}
  >
    <Text>
      {overviewRange === "0"
        ? "Today"
        : overviewRange === "7"
        ? "Last 7 Days"
        : overviewRange === "30"
        ? "Last 30 Days"
        : "Last 90 Days"}
    </Text>
    <Ionicons name="chevron-down" size={14} />
  </TouchableOpacity>

  {showOverviewDropdown && (
    <View style={styles.dropdownMenu}>
      {["0", "7", "30", "90"].map((days) => (
        <TouchableOpacity
          key={days}
          style={styles.dropdownItem}
          onPress={() => {
            setOverviewRange(days);
            setShowOverviewDropdown(false);
          }}
        >
          <Text style={styles.dropdownItemText}>
            {days === "0"
              ? "Today"
              : days === "7"
              ? "Last 7 Days"
              : days === "30"
              ? "Last 30 Days"
              : "Last 90 Days"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>

{/* KPI SECTION */}
{/* KPI SECTION */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.kpiScroll}
  snapToAlignment="start"
  decelerationRate="fast"
  snapToInterval={194} // 180 width + 14 margin
  pagingEnabled={false}
>
  <KPI
    title="Institutions"
    value={totalInstitutions}
    isLoading={isLoading}
    color="#0284C7"
    icon="business-outline"
  />

  <KPI
    title="Active"
    value={activeInstitutions}
    isLoading={isLoading}
    color="#16A34A"
    icon="checkmark-circle-outline"
  />

  <KPI
    title="Disabled"
    value={disabledInstitutions}
    isLoading={isLoading}
    color="#DC2626"
    icon="close-circle-outline"
  />
</ScrollView>

        {/* INSTITUTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest 5 Institutions</Text>
        </View>

        <View style={{ minHeight: 100 }}>
          {isLoading ? (
            <ScrollView horizontal style={{ paddingLeft: 10 }}>
              {[1,2,3,4,5].map((_, i) => (
                <View key={i} style={styles.institutionItem}>
                  <View style={styles.skeletonCircle} />
                  <View style={styles.skeletonText} />
                </View>
              ))}
            </ScrollView>
          ) : latestInstitutions.length === 0 ? (
            <Text style={styles.emptyText}>No institutions yet</Text>
          ) : (
            <ScrollView horizontal style={{ paddingLeft: 10 }}>
              {latestInstitutions.map((inst) => (
                <View key={inst.id} style={styles.institutionItem}>
                  
                  {/* IMAGE OR INITIAL */}
                  {inst.logo ? (
                    <Image
                      source={{ uri: inst.logo }}
                      style={styles.institutionCircle}
                    />
                  ) : (
                    <View style={styles.initialCircle}>
                      <Text style={styles.initialText}>
                        {getInitials(inst.name)}
                      </Text>
                    </View>
                  )}

                  <Text numberOfLines={1} style={styles.institutionLabel}>
                    {inst.name || "Unnamed"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* QUICK ACTION */}
        <Text style={styles.quickTitle}>Quick Action</Text>

        <View style={styles.quickGrid}>
          {[
            {
              icon: "person-outline",
              label: "Invite",
              route: firstInstitution
                ? `/dashboard/superAdminDashboard/institution/${firstInstitution.id}/branches/${firstInstitution.id}/staff/invites/inviteOptions`
                : null,
            },
            { icon: "time-outline", label: "Attendance", route: "/attendance" },
            { icon: "qr-code-outline", label: "QR Codes", route: "/qr-codes" },
            { icon: "ellipsis-horizontal", label: "More", route: "/more" },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickItem}
              onPress={() => q.route && router.push(q.route as any)}
            >
              <Ionicons name={q.icon as any} size={22} color="#0284C7" />
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>


       {/* CHART */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Attendance Overview</Text>
      </View>

      {isLoading ? (
        <View style={styles.chartSkeleton}>
          <View style={styles.fakeLine} />
          <View style={[styles.fakeLine, { width: "85%" }]} />
          <View style={[styles.fakeLine, { width: "70%" }]} />
          <View style={[styles.fakeLine, { width: "60%" }]} />
        </View>
      ) : (
        <View>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 16 }}
            showsHorizontalScrollIndicator={false}
          >
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [
                  { data: chartData.clockIns, color: (o = 1) => `rgba(2,99,235,${o})` },
                  { data: chartData.late, color: (o = 1) => `rgba(249,115,22,${o})` },
                ],
              }}
              width={Math.max(screenWidth - 32, chartData.labels.length * 60)}
              height={250}
              chartConfig={{
                backgroundGradientFrom: "#F8FAFC",
                backgroundGradientTo: "#F8FAFC",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(2,99,235, ${opacity})`,
                labelColor: () => "#64748B",
              }}
              bezier
              style={styles.chart}
            />
          </ScrollView>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#0263EB" }]} />
              <Text style={styles.legendText}>Clock Ins</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#F97316" }]} />
              <Text style={styles.legendText}>Late</Text>
            </View>
          </View>
        </View>
      )}
      {/* COMPARISON */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Institution Comparison</Text>
      </View>

      {isLoading ? (
        [1, 2, 3, 4].map((_, i) => (
          <View key={i} style={styles.progressRow}>
            <View style={styles.skeletonTextWide} />
            <View style={styles.progressBar}>
              <View style={styles.skeletonBar} />
            </View>
          </View>
        ))
      ) : comparisonData.length === 0 ? (
        <Text style={styles.emptyText}>No data available</Text>
      ) : (
        comparisonData.map((inst, idx) => (
          <View key={idx} style={styles.progressRow}>
            <Text>{inst.name}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${inst.percent}%` },
                ]}
              />
            </View>
          </View>
        ))
      )}

      </ScrollView>

      <BottomNav dashboardType="superAdmin" />

      <ResponseModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

/* KPI */
const KPI = ({ title, value, color, icon, isLoading }: any) => (
  <View style={[styles.kpiCard, { backgroundColor: color }]}>
    
    {/* ICON */}
    {isLoading ? (
      <View style={[styles.skeletonCircleSmall]} />
    ) : (
      <Ionicons name={icon} size={18} color="#fff" />
    )}

    {/* VALUE */}
    {isLoading ? (
      <View style={[styles.skeletonValue]} />
    ) : (
      <Text style={styles.kpiNumber}>{value ?? "--"}</Text>
    )}

    {/* TITLE (always show) */}
    <Text style={[styles.kpiTitle, isLoading && { opacity: 0.6 }]}>
      {title}
    </Text>
  </View>
);


/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 16, marginTop: 40 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 50 },

  orgName: { fontWeight: "600" },
  role: { fontSize: 12, color: "#64748B" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", margin: 16 },
  sectionTitle: { fontWeight: "700", fontSize: 16 },

  dropdown: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 6, borderRadius: 10 },

kpiScroll: {
  paddingLeft: 16,
  paddingRight: 30, // space for last card
},

kpiCard: {
  width: 180,              // fixed width for horizontal scroll
  borderRadius: 18,
  padding: 18,
  marginRight: 14,         // spacing between cards
  justifyContent: "center",
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
},
  kpiNumber: { color: "#fff", fontSize: 22, fontWeight: "700" },
  kpiTitle: { color: "#fff", fontSize: 12 },

  institutionItem: { alignItems: "center", marginRight: 10 },
  institutionCircle: { width: 50, height: 50, borderRadius: 25 },
  institutionLabel: { fontSize: 12, marginTop: 6, width: 70, textAlign: "center" },

  quickTitle: { marginLeft: 16, marginTop: 20, fontWeight: "700" },
  quickGrid: { flexDirection: "row", justifyContent: "space-between", margin: 16 },
  quickItem: { alignItems: "center" },
  quickLabel: { fontSize: 11, marginTop: 6 },

  emptyText: { textAlign: "center", marginTop: 20, color: "#64748B" },

  chart: { margin: 16, borderRadius: 16 },

  progressRow: { marginHorizontal: 16, marginTop: 10 },
  progressBar: { height: 10, backgroundColor: "#E2E8F0", borderRadius: 10 },
  progressFill: { height: 10, backgroundColor: "#0284C7", borderRadius: 10 },

  centerLoader: {
  height: 100,
  justifyContent: "center",
  alignItems: "center",
},

initialCircle: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#0284C7",
  justifyContent: "center",
  alignItems: "center",
},

initialText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 14,
},
skeletonBox: {
  backgroundColor: "#E2E8F0",
  borderRadius: 8,
  alignItems: "center", marginRight: 10
},

skeletonCircle: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#E2E8F0",
},

skeletonText: {
  width: 70,
  height: 10,
  marginTop: 6,
  borderRadius: 6,
  textAlign: "center",
  backgroundColor: "#E2E8F0", 
},
skeletonCircleSmall: {
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: "rgba(255,255,255,0.4)",
  marginBottom: 6,
},

skeletonValue: {
  width: 40,
  height: 20,
  borderRadius: 6,
  backgroundColor: "rgba(255,255,255,0.4)",
  marginBottom: 6,
},

chartSkeleton: {
  height: 220,
  margin: 16,
  borderRadius: 16,
  backgroundColor: "#E2E8F0",
  padding: 16,
  justifyContent: "center",
},

fakeLine: {
  height: 4,
  backgroundColor: "#CBD5F5",
  marginVertical: 6,
  borderRadius: 4,
  width: "100%",
},

skeletonTextWide: {
  width: 120,
  height: 10,
  borderRadius: 6,
  backgroundColor: "#E2E8F0",
  marginBottom: 6,
},

skeletonBar: {
  width: "60%",
  height: 10,
  borderRadius: 10,
  backgroundColor: "#CBD5F5",
},

dropdownMenu: {
  position: "absolute",
  top: 40,
  right: 0,
  backgroundColor: "#fff",
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 12,
  elevation: 10,   // android
  zIndex: 999,     // ios
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},
dropdownItem: {
  paddingVertical: 6,
},
dropdownItemText: {
  fontSize: 14,
  color: "#111827",
},

chartLegend: {
  flexDirection: "row",
  justifyContent: "flex-start",
  marginHorizontal: 16,
  marginTop: 6,
  gap: 20,
},

legendItem: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},

legendColor: {
  width: 12,
  height: 12,
  borderRadius: 3,
},

legendText: {
  fontSize: 12,
  color: "#64748B",
},

});

