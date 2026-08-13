import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/theme/theme";
import { PlanBreakdownItem } from "@/types/dashboard";

export default function PlanDonutChart({
  data,
}: {
  data: PlanBreakdownItem[];
}) {
  const safeData = Array.isArray(data)
    ? data
    : [];

  const total = safeData.reduce(
    (sum, item) =>
      sum + Number(item.count || 0),
    0
  );

  if (total === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>
            %
          </Text>
        </View>

        <Text style={styles.emptyTitle}>
          No plan data yet
        </Text>

        <Text style={styles.emptyText}>
          Subscription plan distribution will appear here when plans are available.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* SUMMARY */}

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryTitle}>
            Plan distribution
          </Text>

          <Text style={styles.summarySubtitle}>
            Breakdown of all subscription plans
          </Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalNumber}>
            {total}
          </Text>

          <Text style={styles.totalLabel}>
            total
          </Text>
        </View>
      </View>

      {/* PLAN LIST */}

      <View style={styles.planList}>
        {safeData.map((item) => {
          const count = Number(
            item.count || 0
          );

          const percentage =
            total > 0
              ? Math.round(
                  (count / total) * 100
                )
              : 0;

          return (
            <View
              key={item.plan}
              style={styles.planItem}
            >
              <View style={styles.planHeader}>
                <View style={styles.planNameRow}>
                  <View
                    style={[
                      styles.planDot,
                      {
                        backgroundColor:
                          item.color ||
                          colors.teal,
                      },
                    ]}
                  />

                  <Text
                    style={styles.planName}
                    numberOfLines={1}
                  >
                    {item.plan}
                  </Text>
                </View>

                <Text style={styles.planCount}>
                  {count}{" "}
                  {count === 1
                    ? "account"
                    : "accounts"}
                </Text>
              </View>

              <View style={styles.barRow}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.max(
                          percentage,
                          count > 0 ? 3 : 0
                        )}%`,
                        backgroundColor:
                          item.color ||
                          colors.teal,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.percentage}>
                  {percentage}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* EXPLANATION */}

      <View style={styles.explanationBox}>
        <Text style={styles.explanationIcon}>
          i
        </Text>

        <Text style={styles.explanationText}>
          Each bar shows how many accounts belong to that plan compared with the total number of plans.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  summarySubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 11,
  },

  totalBox: {
    minWidth: 55,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.surface2,
    borderRadius: 11,
  },

  totalNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },

  totalLabel: {
    marginTop: 1,
    color: colors.muted,
    fontSize: 9,
  },

  planList: {
    gap: 18,
  },

  planItem: {
    width: "100%",
  },

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  planDot: {
    width: 10,
    height: 10,
    marginRight: 8,
    borderRadius: 3,
  },

  planName: {
    maxWidth: 180,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  planCount: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  barTrack: {
    flex: 1,
    height: 10,
    overflow: "hidden",
    backgroundColor: colors.surface2,
    borderRadius: 10,
  },

  barFill: {
    height: "100%",
    minWidth: 0,
    borderRadius: 10,
  },

  percentage: {
    width: 42,
    marginLeft: 9,
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },

  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.surface2,
    borderRadius: 10,
  },

  explanationIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  explanationText: {
    flex: 1,
    marginLeft: 7,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface2,
    borderRadius: 17,
  },

  emptyIconText: {
    color: colors.muted,
    fontSize: 22,
    fontWeight: "800",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  emptyText: {
    maxWidth: 260,
    marginTop: 5,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
