import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/theme";
import { currentUser } from "@/data/mockData"; // Keep currentUser if it's static/profile-based
import { useDashboardOverview } from "@/hooks/useDashboardOverview"; // Import your new hook
import DashboardHeader from "./dashboardHeader";
import { AttendanceCard, InstitutionsCard, SubscriptionsCard, UsersCard } from "./KpiSection";
import AttendanceBarChart from "./AttendanceBarChart";
import RevenueAreaChart from "./RevenueAreaChart";
import PlanDonutChart from "./PlanDonutChart";
import InstitutionComparisonList from "./Institutioncomparisonlist";
import LatestInstitutionsList from "./LatestInstitutionsList";
import { TrendPill } from "./Pills";
import BottomNav from "@/components/BottomNav";

function Section({
  icon,
  title,
  right,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.iconChip}>
            <Feather name={icon} size={14} color={colors.muted} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export default function DashboardOverviewScreen() {
  const { data, loading, error, refetch } = useDashboardOverview();

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.base }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.base} />
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Loading dashboard overview...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.base }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.base} />
        <Feather name="alert-circle" size={36} color={colors.muted} />
        <Text style={styles.errorText}>Failed to load dashboard data.</Text>
        <Text style={styles.retryButton} onPress={refetch}>
          Tap to Retry
        </Text>
      </View>
    );
  }

  const { 
    institutionKpis, 
    userKpis, 
    attendanceKpis, 
    subscriptionKpis, 
    attendanceOverview, 
    revenueTrend, 
    planBreakdown, 
    institutionComparison, 
    latestInstitutions 
  } = data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.base }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.base} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <DashboardHeader user={currentUser} />

          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Dashboard overview</Text>
            <Text style={styles.pageSubtitle}>Platform-wide snapshot across institutions, staff, attendance and billing.</Text>
          </View>

          <View style={{ gap: 14 }}>
            <InstitutionsCard data={institutionKpis} />
            <UsersCard data={userKpis} />
            <AttendanceCard data={attendanceKpis} />
            <SubscriptionsCard data={subscriptionKpis} />

            <Section icon="calendar" title="Attendance overview · this week">
              <AttendanceBarChart data={attendanceOverview} />
            </Section>

            <Section
              icon="dollar-sign"
              title="Revenue trend · 12 months"
              right={<TrendPill percent={subscriptionKpis.mrrChangePercent} />}
            >
              <RevenueAreaChart data={revenueTrend} />
            </Section>

            <Section icon="pie-chart" title="Plan breakdown">
              <PlanDonutChart data={planBreakdown} />
            </Section>

            <Section icon="bar-chart-2" title="Attendance by institution">
              <InstitutionComparisonList data={institutionComparison} />
            </Section>

            <Section
              icon="plus-circle"
              title="Latest institutions"
              right={
                <View style={styles.viewAllRow}>
                  <Text style={styles.viewAllText}>View all</Text>
                  <Feather name="chevron-right" size={13} color={colors.teal} />
                </View>
              }
            >
              <LatestInstitutionsList data={latestInstitutions} />
            </Section>
          </View>

          <Text style={styles.footerNote}>Watch Circle Superadmin · data reflects the current reporting period</Text>
        </ScrollView>
      </SafeAreaView>

      <BottomNav dashboardType="superAdmin" />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    color: colors.teal,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 40 },
  titleBlock: { marginTop: 20, marginBottom: 18 },
  pageTitle: { color: colors.text, fontSize: 22, fontWeight: "700" },
  pageSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconChip: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  viewAllRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewAllText: { color: colors.teal, fontSize: 12, fontWeight: "600" },
  footerNote: { color: colors.faint, fontSize: 11, textAlign: "center", marginTop: 24 },
});

