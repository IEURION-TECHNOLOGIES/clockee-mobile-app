import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { colors, fmtNaira } from "@/theme/theme";
import { RevenueTrend } from "@/types/dashboard";

const CHART_HEIGHT = 140;
const PADDING = 12;
const COLUMN_WIDTH = 55;

export default function RevenueAreaChart({ data }: { data: RevenueTrend }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const max = Math.max(...data.revenue);
  const min = Math.min(...data.revenue);
  const range = max - min || 1;

  const totalWidth = Math.max(300, data.revenue.length * COLUMN_WIDTH);
  const stepX = (totalWidth - PADDING * 2) / (data.revenue.length - 1 || 1);

  const points = data.revenue.map((v, i) => ({
    x: PADDING + i * stepX,
    y: PADDING + (1 - (v - min) / range) * (CHART_HEIGHT - PADDING * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: totalWidth }}>
          <View>
            <Svg width={totalWidth} height={CHART_HEIGHT} viewBox={`0 0 ${totalWidth} ${CHART_HEIGHT}`}>
              <Defs>
                <LinearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.teal} stopOpacity={0.35} />
                  <Stop offset="100%" stopColor={colors.teal} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={areaPath} fill="url(#revFill)" stroke="none" />
              <Path d={linePath} fill="none" stroke={colors.teal} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={activeIndex === i ? 5 : 3}
                  fill={colors.base}
                  stroke={colors.teal}
                  strokeWidth={2}
                />
              ))}
            </Svg>

            <View style={[StyleSheet.absoluteFill, { width: totalWidth }]}>
              <View style={styles.touchRow}>
                {data.labels.map((label, i) => (
                  <Pressable
                    key={label}
                    style={{ width: COLUMN_WIDTH, height: "100%" }}
                    onPress={() => setActiveIndex(activeIndex === i ? null : i)}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.labelRow, { width: totalWidth }]}>
            {data.labels.map((label, i) => (
              <View key={label} style={{ width: COLUMN_WIDTH, alignItems: "center" }}>
                <Text style={[styles.label, activeIndex === i && { color: colors.text }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {activeIndex !== null && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipMonth}>{data.labels[activeIndex]}</Text>
          <Text style={styles.tooltipValue}>{fmtNaira(data.revenue[activeIndex])}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  touchRow: { flex: 1, flexDirection: "row" },
  labelRow: { flexDirection: "row", marginTop: 4 },
  label: { color: colors.muted, fontSize: 11, textAlign: "center" },
  tooltip: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tooltipMonth: { color: colors.muted, fontSize: 11 },
  tooltipValue: { color: colors.text, fontSize: 13, fontWeight: "700" },
});