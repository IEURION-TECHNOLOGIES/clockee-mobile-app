// BranchCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type BranchLog = {
  id: string;
  timestamp: string;
  action: "BRANCH_CREATED" | "BRANCH_SUSPENDED" | "BRANCH_ACTIVATED" | "BRANCH_UPDATED";
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

type BranchCardProps = {
  branch: BranchLog;
  formatTimestamp: (ts: string) => string;
};

export default function BranchCard({ branch, formatTimestamp }: BranchCardProps) {
  const getActionColor = () => {
    switch (branch.action) {
      case "BRANCH_CREATED": return "#10B981";
      case "BRANCH_SUSPENDED": return "#EF4444";
      case "BRANCH_ACTIVATED": return "#3B82F6";
      case "BRANCH_UPDATED": return "#F59E0B";
      default: return "#64748B";
    }
  };

  const getActionIcon = () => {
    switch (branch.action) {
      case "BRANCH_CREATED": return "add-circle-outline";
      case "BRANCH_SUSPENDED": return "close-circle-outline";
      case "BRANCH_ACTIVATED": return "checkmark-circle-outline";
      case "BRANCH_UPDATED": return "create-outline";
      default: return "git-branch-outline";
    }
  };

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: `${getActionColor()}15` }]}>
        <Ionicons name={getActionIcon()} size={20} color={getActionColor()} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{branch.description}</Text>
        
        <View style={styles.meta}>
          <Text style={styles.actor}>{branch.actor.name}</Text>
          <Text style={styles.role}> • {branch.actor.role}</Text>
          <Text style={styles.target}> • {branch.target.name}</Text>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.day}>{branch.day}</Text>
          <Text style={styles.time}>{formatTimestamp(branch.timestamp)}</Text>
        </View>
      </View>

      <View style={[styles.badge, styles.created_badge]}>
        <Text style={[styles.badgeText, styles.created_badge_text]}>
          {branch.action.replace("BRANCH_", "")}
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

  created_badge: {
    backgroundColor: "#DBEAFE",
  },

  created_badge_text: {
    color: "#1E40AF",
  },
});