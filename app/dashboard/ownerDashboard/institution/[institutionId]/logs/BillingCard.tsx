// BillingCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type BillingLog = {
  id: string;
  timestamp: string;
  action: "SUBSCRIPTION_RENEWED" | "PAYMENT_RECEIVED" | "PAYMENT_FAILED" | "INVOICE_GENERATED";
  actor: {
    name: string;
    role: string;
  };
  description: string;
  amount?: string;
  month: string;
  week: string;
  day: string;
};

type BillingCardProps = {
  billing: BillingLog;
  formatTimestamp: (ts: string) => string;
};

export default function BillingCard({ billing, formatTimestamp }: BillingCardProps) {
  const getActionColor = () => {
    switch (billing.action) {
      case "SUBSCRIPTION_RENEWED": return "#10B981";
      case "PAYMENT_RECEIVED": return "#10B981";
      case "PAYMENT_FAILED": return "#EF4444";
      case "INVOICE_GENERATED": return "#3B82F6";
      default: return "#64748B";
    }
  };

  const getActionIcon = () => {
    switch (billing.action) {
      case "SUBSCRIPTION_RENEWED": return "refresh-outline";
      case "PAYMENT_RECEIVED": return "card-outline";
      case "PAYMENT_FAILED": return "close-circle-outline";
      case "INVOICE_GENERATED": return "document-text-outline";
      default: return "card-outline";
    }
  };

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: `${getActionColor()}15` }]}>
        <Ionicons name={getActionIcon()} size={20} color={getActionColor()} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{billing.description}</Text>
        
        <View style={styles.meta}>
          <Text style={styles.actor}>{billing.actor.name}</Text>
          <Text style={styles.role}> • {billing.actor.role}</Text>
          {billing.amount && (
            <Text style={styles.amount}> • {billing.amount}</Text>
          )}
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.day}>{billing.day}</Text>
          <Text style={styles.time}>{formatTimestamp(billing.timestamp)}</Text>
        </View>
      </View>

      <View style={[styles.badge, styles.billing_badge]}>
        <Text style={[styles.badgeText, styles.billing_badge_text]}>
          {billing.action.replace("SUBSCRIPTION_", "").replace("PAYMENT_", "").replace("INVOICE_", "")}
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

  amount: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "700",
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

  billing_badge: {
    backgroundColor: "#FEF3C7",
  },

  billing_badge_text: {
    color: "#92400E",
  },
});