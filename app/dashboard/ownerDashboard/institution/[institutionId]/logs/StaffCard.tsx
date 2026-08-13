// StaffCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type StaffLog = {
  id: string;
  timestamp: string;
  action: "STAFF_ADDED" | "STAFF_REMOVED" | "STAFF_UPDATED" | "STAFF_PROMOTED";
  actor: {
    name: string;
    role: string;
  };
  target: {
    type: string;
    name: string;
  };
  description: string;
  month: string;
  week: string;
  day: string;
};

type StaffCardProps = {
  staff: StaffLog;
  formatTimestamp: (ts: string) => string;
};

export default function StaffCard({ staff, formatTimestamp }: StaffCardProps) {
  const getActionColor = () => {
    switch (staff.action) {
      case "STAFF_ADDED": return "#10B981";
      case "STAFF_REMOVED": return "#EF4444";
      case "STAFF_UPDATED": return "#3B82F6";
      case "STAFF_PROMOTED": return "#F59E0B";
      default: return "#64748B";
    }
  };

  const getActionIcon = () => {
    switch (staff.action) {
      case "STAFF_ADDED": return "person-add-outline";
      case "STAFF_REMOVED": return "person-remove-outline";
      case "STAFF_UPDATED": return "create-outline";
      case "STAFF_PROMOTED": return "trending-up-outline";
      default: return "people-outline";
    }
  };

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: `${getActionColor()}15` }]}>
        <Ionicons name={getActionIcon()} size={20} color={getActionColor()} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{staff.description}</Text>
        
        <View style={styles.meta}>
          <Text style={styles.actor}>{staff.actor.name}</Text>
          <Text style={styles.role}> • {staff.actor.role}</Text>
          <Text style={styles.target}> • {staff.target.name}</Text>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.day}>{staff.day}</Text>
          <Text style={styles.time}>{formatTimestamp(staff.timestamp)}</Text>
        </View>
      </View>

      <View style={[styles.badge, styles.staff_badge]}>
        <Text style={[styles.badgeText, styles.staff_badge_text]}>
          {staff.action.replace("STAFF_", "")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
  },

  description: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 5,
  },

  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },

  actor: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },

  role: {
    fontSize: 11,
    color: "#94A3B8",
  },

  target: {
    fontSize: 11,
    color: "#94A3B8",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },

  day: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0284C7",
  },

  time: {
    fontSize: 10,
    color: "#94A3B8",
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontSize: 8,
    fontWeight: "800",
  },

  staff_badge: {
    backgroundColor: "#F3E8FF",
  },

  staff_badge_text: {
    color: "#6B21A8",
  },
});
