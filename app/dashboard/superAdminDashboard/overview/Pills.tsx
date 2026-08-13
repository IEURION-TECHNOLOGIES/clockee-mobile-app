import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, hexToRgba } from "@/theme/theme";

export function Chip({ color, label, value }: { color: string; label: string; value: string | number }) {
  return (
    <View style={[styles.chip, { backgroundColor: hexToRgba(color, 0.1) }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

export function Badge({
  children,
  color = colors.teal,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: hexToRgba(color, 0.12), borderColor: hexToRgba(color, 0.28) },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

export function TrendPill({ percent }: { percent: number }) {
  const up = percent >= 0;
  const color = up ? colors.teal : colors.red;
  return (
    <View style={styles.trendRow}>
      <Feather name={up ? "arrow-up-right" : "arrow-down-right"} size={13} color={color} />
      <Text style={[styles.trendText, { color }]}>{Math.abs(percent)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  chipLabel: { fontSize: 12, color: colors.muted },
  chipValue: { fontSize: 12, fontWeight: "700", color: colors.text },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  trendText: { fontSize: 12, fontWeight: "700" },
});