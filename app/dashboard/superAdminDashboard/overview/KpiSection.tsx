import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import {
  colors,
  fmt,
  fmtNaira,
} from "@/theme/theme";

import {
  AttendanceKpis,
  InstitutionKpis,
  SubscriptionKpis,
  UserKpis,
} from "@/types/dashboard";

import { TrendPill } from "./Pills";

/* ================= SHARED COMPONENTS ================= */

function CardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

function PanelHeader({
  icon,
  label,
  description,
  right,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.panelHeader}>
      <View style={styles.panelHeaderLeft}>
        <View style={styles.iconChip}>
          <Feather
            name={icon}
            size={16}
            color={colors.teal}
          />
        </View>

        <View>
          <Text style={styles.panelLabel}>
            {label}
          </Text>

          {description && (
            <Text style={styles.panelDescription}>
              {description}
            </Text>
          )}
        </View>
      </View>

      {right}
    </View>
  );
}

function ProgressBar({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) {
  const safePercentage = Math.min(
    Math.max(Number(percentage) || 0, 0),
    100
  );

  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${safePercentage}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.statValue,
          color && {
            color,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function StatGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.statGrid}>
      {children}
    </View>
  );
}

/* ================= INSTITUTIONS ================= */

export function InstitutionsCard({
  data,
}: {
  data: InstitutionKpis;
}) {
  const total = Number(data.total || 0);
  const active = Number(data.active || 0);

  const activePercentage =
    total > 0
      ? Math.round((active / total) * 100)
      : 0;

  return (
    <CardShell>
      <PanelHeader
        icon="home"
        label="Institutions"
        description="Your institution accounts"
        right={
          <View style={styles.newBadge}>
            <Feather
              name="plus"
              size={12}
              color={colors.teal}
            />

            <Text style={styles.newBadgeText}>
              {data.newThisPeriod || 0} new
            </Text>
          </View>
        }
      />

      <View style={styles.mainMetricRow}>
        <View>
          <Text style={styles.mainNumber}>
            {fmt(total)}
          </Text>

          <Text style={styles.mainLabel}>
            Total institutions
          </Text>
        </View>

        <View style={styles.percentageBox}>
          <Text
            style={[
              styles.percentageNumber,
              {
                color: colors.teal,
              },
            ]}
          >
            {activePercentage}%
          </Text>

          <Text style={styles.percentageLabel}>
            active
          </Text>
        </View>
      </View>

      <ProgressBar
        percentage={activePercentage}
        color={colors.teal}
      />

      <Text style={styles.explanation}>
        {active} of {total} institutions are active.
      </Text>

      <StatGrid>
        <StatItem
          label="Active"
          value={data.active || 0}
          color={colors.teal}
        />

        <StatItem
          label="Pending"
          value={data.pending || 0}
          color={colors.amber}
        />

        <StatItem
          label="Disabled"
          value={data.disabled || 0}
          color={colors.red}
        />
      </StatGrid>
    </CardShell>
  );
}

/* ================= USERS ================= */

export function UsersCard({
  data,
}: {
  data: UserKpis;
}) {
  const totalStaff = Number(
    data.totalStaff || 0
  );

  const activeToday = Number(
    data.activeUsersToday || 0
  );

  const activePercentage =
    totalStaff > 0
      ? Math.round(
          (activeToday / totalStaff) * 100
        )
      : 0;

  return (
    <CardShell>
      <PanelHeader
        icon="users"
        label="Users"
        description="Staff and administrator accounts"
        right={
          <View style={styles.newBadge}>
            <Feather
              name="user-plus"
              size={12}
              color={colors.indigo}
            />

            <Text
              style={[
                styles.newBadgeText,
                {
                  color: colors.indigo,
                },
              ]}
            >
              {data.newSignupsThisPeriod || 0} new
            </Text>
          </View>
        }
      />

      <View style={styles.mainMetricRow}>
        <View>
          <Text style={styles.mainNumber}>
            {fmt(totalStaff)}
          </Text>

          <Text style={styles.mainLabel}>
            Total staff
          </Text>
        </View>

        <View style={styles.percentageBox}>
          <Text
            style={[
              styles.percentageNumber,
              {
                color: colors.indigo,
              },
            ]}
          >
            {activePercentage}%
          </Text>

          <Text style={styles.percentageLabel}>
            active today
          </Text>
        </View>
      </View>

      <ProgressBar
        percentage={activePercentage}
        color={colors.indigo}
      />

      <Text style={styles.explanation}>
        {activeToday} of {totalStaff} staff members are active today.
      </Text>

      <StatGrid>
        <StatItem
          label="Administrators"
          value={data.totalAdmins || 0}
          color={colors.indigo}
        />

        <StatItem
          label="Active today"
          value={activeToday}
          color={colors.teal}
        />

        <StatItem
          label="New signups"
          value={data.newSignupsThisPeriod || 0}
          color={colors.sky}
        />
      </StatGrid>
    </CardShell>
  );
}

/* ================= ATTENDANCE ================= */

export function AttendanceCard({
  data,
}: {
  data: AttendanceKpis;
}) {
  const clockIns = Number(
    data.todayClockIns || 0
  );

  const late = Number(
    data.todayLateCount || 0
  );

  const absent = Number(
    data.todayAbsentCount || 0
  );

  const attendanceRate = Math.min(
    Math.max(
      Number(data.attendanceRatePercent) || 0,
      0
    ),
    100
  );

  return (
    <CardShell>
      <PanelHeader
        icon="clock"
        label="Attendance today"
        description="Staff attendance for today"
        right={
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              Live
            </Text>
          </View>
        }
      />

      <View style={styles.mainMetricRow}>
        <View>
          <Text style={styles.mainNumber}>
            {clockIns}
          </Text>

          <Text style={styles.mainLabel}>
            Clock-ins today
          </Text>
        </View>

        <View style={styles.percentageBox}>
          <Text
            style={[
              styles.percentageNumber,
              {
                color:
                  attendanceRate >= 80
                    ? colors.teal
                    : attendanceRate > 0
                      ? colors.amber
                      : colors.red,
              },
            ]}
          >
            {attendanceRate}%
          </Text>

          <Text style={styles.percentageLabel}>
            attendance rate
          </Text>
        </View>
      </View>

      <ProgressBar
        percentage={attendanceRate}
        color={
          attendanceRate >= 80
            ? colors.teal
            : attendanceRate > 0
              ? colors.amber
              : colors.red
        }
      />

      <Text style={styles.explanation}>
        {clockIns} staff clocked in and {absent} were absent.
      </Text>

      <StatGrid>
        <StatItem
          label="Clock-ins"
          value={clockIns}
          color={colors.teal}
        />

        {/* <StatItem
          label="Late"
          value={late}
          color={colors.amber}
        /> */}

        <StatItem
          label="Absent"
          value={absent}
          color={colors.red}
        />

        {/* <StatItem
          label="On-time rate"
          value={`${data.onTimeRatePercent || 0}%`}
          color={colors.teal}
        /> */}
      </StatGrid>
    </CardShell>
  );
}

/* ================= SUBSCRIPTIONS ================= */

export function SubscriptionsCard({
  data,
}: {
  data: SubscriptionKpis;
}) {
  const active = Number(
    data.activeCount || 0
  );

  const trial = Number(
    data.trialCount || 0
  );

  const expired = Number(
    data.expiredCount || 0
  );

  const cancelled = Number(
    data.cancelledCount || 0
  );

  return (
    <CardShell>
      <PanelHeader
        icon="credit-card"
        label="Subscriptions"
        description="Subscription and revenue summary"
        right={
          <TrendPill
            percent={data.mrrChangePercent}
          />
        }
      />

      <View style={styles.revenueRow}>
        <View>
          <Text style={styles.mainNumber}>
            {fmtNaira(data.mrr || 0)}
          </Text>

          <Text style={styles.mainLabel}>
            Monthly recurring revenue
          </Text>
        </View>

        <View style={styles.revenueIcon}>
          <Feather
            name="dollar-sign"
            size={20}
            color={colors.teal}
          />
        </View>
      </View>

      <View style={styles.subscriptionList}>
        <SubscriptionRow
          label="Active subscriptions"
          value={active}
          color={colors.teal}
        />

        <SubscriptionRow
          label="Trial subscriptions"
          value={trial}
          color={colors.sky}
        />

        <SubscriptionRow
          label="Expired subscriptions"
          value={expired}
          color={colors.amber}
        />

        <SubscriptionRow
          label="Cancelled subscriptions"
          value={cancelled}
          color={colors.red}
        />
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.footerLabel}>
            Average revenue per account
          </Text>

          <Text style={styles.footerValue}>
            {fmtNaira(data.arpu || 0)}
          </Text>
        </View>

        <View style={styles.footerRight}>
          <Text style={styles.footerLabel}>
            Churn rate
          </Text>

          <Text
            style={[
              styles.footerValue,
              {
                color: colors.red,
              },
            ]}
          >
            {data.churnRatePercent || 0}%
          </Text>
        </View>
      </View>
    </CardShell>
  );
}

function SubscriptionRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.subscriptionRow}>
      <View style={styles.subscriptionLabelRow}>
        <View
          style={[
            styles.subscriptionDot,
            {
              backgroundColor: color,
            },
          ]}
        />

        <Text style={styles.subscriptionLabel}>
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.subscriptionValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  panelHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconChip: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    backgroundColor: colors.surface2,
    borderRadius: 10,
  },

  panelLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  panelDescription: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 10,
  },

  mainMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  mainNumber: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },

  mainLabel: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
  },

  percentageBox: {
    alignItems: "flex-end",
  },

  percentageNumber: {
    fontSize: 23,
    fontWeight: "900",
  },

  percentageLabel: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 10,
  },

  progressTrack: {
    height: 10,
    marginTop: 18,
    overflow: "hidden",
    backgroundColor: colors.surface2,
    borderRadius: 10,
  },

  progressFill: {
    height: "100%",
    minWidth: 2,
    borderRadius: 10,
  },

  explanation: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  statItem: {
    width: "50%",
    paddingVertical: 5,
  },

  statLabel: {
    color: colors.muted,
    fontSize: 10,
  },

  statValue: {
    marginTop: 3,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: colors.surface2,
    borderRadius: 10,
  },

  newBadgeText: {
    marginLeft: 4,
    color: colors.teal,
    fontSize: 10,
    fontWeight: "800",
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    backgroundColor: colors.teal,
    borderRadius: 5,
  },

  liveText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  revenueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  revenueIcon: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface2,
    borderRadius: 14,
  },

  subscriptionList: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  subscriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 35,
  },

  subscriptionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  subscriptionDot: {
    width: 8,
    height: 8,
    marginRight: 8,
    borderRadius: 4,
  },

  subscriptionLabel: {
    color: colors.muted,
    fontSize: 11,
  },

  subscriptionValue: {
    fontSize: 14,
    fontWeight: "900",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  footerRight: {
    alignItems: "flex-end",
  },

  footerLabel: {
    color: colors.muted,
    fontSize: 10,
  },

  footerValue: {
    marginTop: 3,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
});
