import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fmt, hexToRgba, planColor } from "@/theme/theme";
import { Badge } from "./Pills";
import { LatestInstitution } from "@/types/dashboard";

function InstLogo({ logo, name, plan }: { logo: string | null; name: string; plan: string }) {
  const [failed, setFailed] = useState(!logo);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = planColor[plan] ?? colors.muted;

  if (failed) {
    return (
      <View style={[styles.logo, { backgroundColor: hexToRgba(color, 0.15) }]}>
        <Text style={[styles.logoInitials, { color }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: logo as string }}
      onError={() => setFailed(true)}
      style={[styles.logo, { backgroundColor: colors.surface2 }]}
    />
  );
}

export default function LatestInstitutionsList({ data }: { data: LatestInstitution[] }) {
  return (
    <View style={{ gap: 4 }}>
      {data.map((inst, i) => (
        <Pressable key={inst.id} style={[styles.row, i > 0 && styles.rowBorder]}>
          <InstLogo logo={inst.logo} name={inst.name} plan={inst.plan} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{inst.name}</Text>
            <Text style={styles.id}>{inst.id}</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Badge color={planColor[inst.plan]}>{inst.plan}</Badge>
            <Text style={styles.staff}>{fmt(inst.staffCount)} staff</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.faint} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  logo: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoInitials: { fontSize: 12, fontWeight: "700" },
  name: { color: colors.text, fontSize: 14, fontWeight: "600" },
  id: { color: colors.faint, fontSize: 11, marginTop: 2 },
  staff: { color: colors.muted, fontSize: 11 },
});
