import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/theme";
import { InstitutionComparisonItem } from "@/types/dashboard";

export default function InstitutionComparisonList({ data }: { data: InstitutionComparisonItem[] }) {
  return (
    <View style={{ gap: 16 }}>
      {data.map((inst) => {
        const color = inst.attendancePercent >= 90 ? colors.teal : inst.attendancePercent >= 80 ? colors.sky : colors.amber;
        return (
          <View key={inst.id}>
            <View style={styles.row}>
              <Text style={styles.name}>{inst.name}</Text>
              <Text style={[styles.percent, { color }]}>{inst.attendancePercent}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${inst.attendancePercent}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  name: { color: colors.text, fontSize: 13 },
  percent: { fontSize: 13, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
});
