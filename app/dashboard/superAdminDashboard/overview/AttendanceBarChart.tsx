import React, { useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/theme/theme";
import { AttendanceOverview } from "@/types/dashboard";

const CHART_HEIGHT = 140;

export default function AttendanceBarChart({
  data,
}: {
  data: AttendanceOverview;
}) {
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const safeLabels = data?.labels || [];
  const safeClockIns = data?.clockIns || [];
  const safeLate = data?.late || [];

  const totals = safeLabels.map((_, index) => {
    return Number(safeClockIns[index] || 0);
  });

  const max = Math.max(
    ...totals,
    1
  );

  const totalClockIns = totals.reduce(
    (sum, value) => sum + value,
    0
  );

  const totalLate = safeLabels.reduce(
    (sum, _, index) =>
      sum + Number(safeLate[index] || 0),
    0
  );

  const totalOnTime = Math.max(
    totalClockIns - totalLate,
    0
  );

  return (
    <View>
      {/* CHART SUMMARY */}

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryTitle}>
            Weekly clock-ins
          </Text>

          <Text style={styles.summarySubtitle}>
            {totalClockIns} total attendance record
            {totalClockIns === 1 ? "" : "s"}
          </Text>
        </View>

        <View style={styles.summaryValueBox}>
          <Text style={styles.summaryValue}>
            {totalClockIns}
          </Text>

          <Text style={styles.summaryValueLabel}>
            total
          </Text>
        </View>
      </View>

      {/* LEGEND */}

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendSwatch,
              {
                backgroundColor: colors.teal,
              },
            ]}
          />

          <Text style={styles.legendText}>
            On time ({totalOnTime})
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendSwatch,
              {
                backgroundColor: colors.amber,
              },
            ]}
          />

          <Text style={styles.legendText}>
            Late ({totalLate})
          </Text>
        </View>
      </View>

      {/* TOOLTIP */}

      {activeIndex !== null && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDay}>
            {safeLabels[activeIndex]}
          </Text>

          <Text style={styles.tooltipLine}>
            Total clock-ins:{" "}
            {totals[activeIndex]}
          </Text>

          <Text style={styles.tooltipLine}>
            <Text
              style={{
                color: colors.teal,
              }}
            >
              On time:{" "}
            </Text>
            {getOnTimeCount(
              safeClockIns[activeIndex],
              safeLate[activeIndex]
            )}
          </Text>

          <Text style={styles.tooltipLine}>
            <Text
              style={{
                color: colors.amber,
              }}
            >
              Late:{" "}
            </Text>
            {Math.min(
              Number(safeLate[activeIndex] || 0),
              totals[activeIndex]
            )}
          </Text>
        </View>
      )}

      {/* BAR CHART */}

      <View style={styles.chartRow}>
        {safeLabels.map((label, index) => {
          const total =
            Number(safeClockIns[index] || 0);

          const late = Math.min(
            Number(safeLate[index] || 0),
            total
          );

          const onTime = Math.max(
            total - late,
            0
          );

          const onTimeHeight =
            (onTime / max) * CHART_HEIGHT;

          const lateHeight =
            (late / max) * CHART_HEIGHT;

          const active =
            activeIndex === index;

          const hasData = total > 0;

          return (
            <Pressable
              key={`${label}-${index}`}
              style={styles.barColumn}
              onPress={() =>
                setActiveIndex(
                  active ? null : index
                )
              }
            >
              <Text style={styles.totalLabel}>
                {hasData ? total : "-"}
              </Text>

              <View
                style={[
                  styles.barTrack,
                  {
                    height: CHART_HEIGHT,
                  },
                ]}
              >
                <View style={styles.emptyBarSpace} />

                {/* LATE SEGMENT */}

                {late > 0 && (
                  <View
                    style={[
                      styles.barSegment,
                      {
                        height: lateHeight,
                        backgroundColor:
                          colors.amber,
                        opacity:
                          active ||
                          activeIndex === null
                            ? 1
                            : 0.35,
                        borderTopLeftRadius:
                          onTime === 0 ? 5 : 0,
                        borderTopRightRadius:
                          onTime === 0 ? 5 : 0,
                      },
                    ]}
                  />
                )}

                {/* ON-TIME SEGMENT */}

                {onTime > 0 && (
                  <View
                    style={[
                      styles.barSegment,
                      {
                        height: onTimeHeight,
                        backgroundColor:
                          colors.teal,
                        opacity:
                          active ||
                          activeIndex === null
                            ? 1
                            : 0.35,
                        borderTopLeftRadius:
                          late === 0 ? 5 : 0,
                        borderTopRightRadius:
                          late === 0 ? 5 : 0,
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                      },
                    ]}
                  />
                )}

                {/* EMPTY DAY */}

                {!hasData && (
                  <View
                    style={[
                      styles.noDataBar,
                      {
                        opacity:
                          active ||
                          activeIndex === null
                            ? 1
                            : 0.35,
                      },
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.barLabel,
                  active && styles.barLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.chartExplanation}>
        Each bar represents the number of staff clock-ins for that day. Amber means late and teal means on time.
      </Text>
    </View>
  );
}

function getOnTimeCount(
  clockIns?: number,
  late?: number
) {
  return Math.max(
    Number(clockIns || 0) -
      Number(late || 0),
    0
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  summaryTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  summarySubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
  },

  summaryValueBox: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 52,
    paddingVertical: 6,
    paddingHorizontal: 9,
    backgroundColor: colors.surface2,
    borderRadius: 10,
  },

  summaryValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },

  summaryValueLabel: {
    marginTop: 1,
    color: colors.muted,
    fontSize: 9,
  },

  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 14,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendSwatch: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },

  legendText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  tooltip: {
    position: "absolute",
    top: 65,
    right: 0,
    zIndex: 10,
    minWidth: 145,
    padding: 10,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },

  tooltipDay: {
    marginBottom: 5,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  tooltipLine: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 17,
  },

  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  barColumn: {
    flex: 1,
    alignItems: "center",
  },

  totalLabel: {
    height: 17,
    marginBottom: 5,
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
  },

  barTrack: {
    width: 20,
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: colors.surface2,
    borderRadius: 5,
    overflow: "hidden",
  },

  emptyBarSpace: {
    flex: 1,
  },

  barSegment: {
    width: "100%",
  },

  noDataBar: {
    width: "100%",
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 5,
  },

  barLabel: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  barLabelActive: {
    color: colors.text,
    fontWeight: "800",
  },

  chartExplanation: {
    marginTop: 15,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },
});
