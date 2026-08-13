// SubscriptionDashboard.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Subscription = {
  activePlan: string | null;
  planName: string | null;
  billingCycle: "monthly" | "yearly" | null;
  status:
    | "active"
    | "trialing"
    | "past_due"
    | "cancelled"
    | "unpaid"
    | null;
  amount: number;
  currency: string;
  startedAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
};

type SubscriptionDashboardProps = {
  subscription?: Subscription;
  onUpgrade: () => void;
  onManageBilling: () => void;
  onViewInvoices: () => void;
};

const EMPTY_SUBSCRIPTION: Subscription = {
  activePlan: null,
  planName: null,
  billingCycle: null,
  status: null,
  amount: 0,
  currency: "NGN",
  startedAt: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  trialEndsAt: null,
};

type IconName = keyof typeof Ionicons.glyphMap;

export default function SubscriptionDashboard({
  subscription = EMPTY_SUBSCRIPTION,
  onUpgrade,
  onManageBilling,
  onViewInvoices,
}: SubscriptionDashboardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

 const formatAmount = (
  price: number,
  currency: string
) => {
  const symbol =
    currency === "NGN" ? "₦" : "$";

  return `${symbol}${price.toLocaleString()}`;
};

  const getStatusColor = () => {
    switch (subscription.status) {
      case "active":
        return "#10B981";
      case "trialing":
        return "#3B82F6";
      case "past_due":
        return "#EF4444";
      case "cancelled":
        return "#F59E0B";
      case "unpaid":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getStatusText = () => {
    switch (subscription.status) {
      case "active":
        return "Active";
      case "trialing":
        return "Free Trial";
      case "past_due":
        return "Payment Failed";
      case "cancelled":
        return "Cancelled";
      case "unpaid":
        return "Unpaid";
      default:
        return "Free";
    }
  };

  const isOnFreePlan =
    !subscription.activePlan || subscription.activePlan === "Standard";

  const statusColor = getStatusColor();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.heroLabelRow}>
            <View style={styles.heroSmallIcon}>
              <Ionicons name="card-outline" size={16} color="#FFFFFF" />
            </View>

            <Text style={styles.heroLabel}>BILLING CENTER</Text>
          </View>

          <Text style={styles.heroTitle}>Your Subscription</Text>

          <Text style={styles.heroSubtitle}>
            Manage your plan, payment methods, and billing preferences.
          </Text>
        </View>

        <View style={styles.heroDecoration}>
          <View style={[styles.heroCircle, styles.circleOne]} />
          <View style={[styles.heroCircle, styles.circleTwo]} />
          <View style={styles.heroStar}>
            <Ionicons name="sparkles" size={22} color="#BAE6FD" />
          </View>
        </View>
      </View>

      {/* CURRENT PLAN */}
      <View style={styles.planCard}>
        <View style={styles.planCardHeader}>
          <View style={styles.planIdentity}>
            <View style={styles.planIcon}>
              <Ionicons
                name={isOnFreePlan ? "leaf-outline" : "rocket-outline"}
                size={24}
                color="#0284C7"
              />
            </View>

            <View style={styles.planIdentityText}>
              <Text style={styles.planLabel}>CURRENT PLAN</Text>
              <Text style={styles.planName}>
                {subscription.planName || "Free Trial"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />

            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        <View style={styles.planPricing}>
          <Text style={styles.planAmount}>
            {formatAmount(subscription.amount, subscription.currency)}
          </Text>

          <Text style={styles.planPeriod}>
            {subscription.status === "trialing"
              ? "30-day trial"
              : subscription.billingCycle || "monthly"}
          </Text>
        </View>

        {subscription.status === "active" &&
          subscription.currentPeriodEnd && (
            <BillingNotice
              icon="calendar-outline"
              iconColor="#0284C7"
              backgroundColor="#F0F9FF"
              text="Renews on"
              value={formatDate(subscription.currentPeriodEnd)}
            />
          )}

        {subscription.status === "trialing" && subscription.trialEndsAt && (
          <BillingNotice
            icon="gift-outline"
            iconColor="#3B82F6"
            backgroundColor="#EFF6FF"
            text="Trial ends on"
            value={formatDate(subscription.trialEndsAt)}
          />
        )}

        {subscription.cancelAtPeriodEnd &&
          subscription.currentPeriodEnd && (
            <BillingNotice
              icon="alert-circle-outline"
              iconColor="#F59E0B"
              backgroundColor="#FFFBEB"
              text="Access ends on"
              value={formatDate(subscription.currentPeriodEnd)}
            />
          )}
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.actionsSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Manage subscription</Text>
            <Text style={styles.sectionSubtitle}>
              Quick access to your billing tools
            </Text>
          </View>

          <Ionicons
            name="arrow-forward-circle-outline"
            size={22}
            color="#CBD5E1"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsContent}
        >
          <QuickActionCard
            icon="sparkles-outline"
            title={isOnFreePlan ? "Choose Plan" : "Upgrade"}
            description="Get more features"
            color="#0284C7"
            backgroundColor="#E0F2FE"
            onPress={onUpgrade}
          />

          <QuickActionCard
            icon="card-outline"
            title="Billing"
            description="Manage payments"
            color="#7C3AED"
            backgroundColor="#EDE9FE"
            onPress={onManageBilling}
          />

          <QuickActionCard
            icon="receipt-outline"
            title="Invoices"
            description="View payment history"
            color="#059669"
            backgroundColor="#D1FAE5"
            onPress={onViewInvoices}
          />
        </ScrollView>
      </View>

      {/* FEATURES */}
      <View style={styles.featuresCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Included Features</Text>
            <Text style={styles.cardSubtitle}>
              What is available on your current plan
            </Text>
          </View>

          <View style={styles.checkHeaderIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#10B981"
            />
          </View>
        </View>

        <View style={styles.featuresGrid}>
          <FeatureItem
            icon="business-outline"
            text={isOnFreePlan ? "1 Branch" : "Multiple Branches"}
          />

          <FeatureItem
            icon="people-outline"
            text={isOnFreePlan ? "Up to 5 Staff" : "Unlimited Staff"}
          />

          <FeatureItem
            icon="time-outline"
            text={isOnFreePlan ? "7-day History" : "Unlimited History"}
          />

          <FeatureItem
            icon="shield-checkmark-outline"
            text={isOnFreePlan ? "Basic Support" : "Priority Support"}
          />
        </View>
      </View>

      {/* PAYMENT FAILED ALERT */}
      {subscription.status === "past_due" && (
        <View style={styles.alertCardDanger}>
          <View style={styles.alertIconDanger}>
            <Ionicons name="warning-outline" size={23} color="#EF4444" />
          </View>

          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Payment Failed</Text>
            <Text style={styles.alertMessage}>
              Update your payment method to avoid service interruption.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.alertButton}
            onPress={onManageBilling}
            activeOpacity={0.8}
          >
            <Text style={styles.alertButtonText}>Fix Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CANCELLATION ALERT */}
      {subscription.cancelAtPeriodEnd &&
        subscription.currentPeriodEnd && (
          <View style={styles.alertCardWarning}>
            <View style={styles.alertIconWarning}>
              <Ionicons
                name="alert-circle-outline"
                size={23}
                color="#F59E0B"
              />
            </View>

            <View style={styles.alertContent}>
              <Text style={styles.warningTitle}>Subscription ending</Text>
              <Text style={styles.warningMessage}>
                Your access continues until{" "}
                <Text style={styles.warningDate}>
                  {formatDate(subscription.currentPeriodEnd)}
                </Text>
                .
              </Text>
            </View>
          </View>
        )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

/* ================= BILLING NOTICE ================= */

function BillingNotice({
  icon,
  iconColor,
  backgroundColor,
  text,
  value,
}: {
  icon: IconName;
  iconColor: string;
  backgroundColor: string;
  text: string;
  value: string;
}) {
  return (
    <View style={[styles.billingNotice, { backgroundColor }]}>
      <View style={styles.billingNoticeIcon}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text style={styles.billingText}>
        {text} <Text style={styles.billingDate}>{value}</Text>
      </Text>
    </View>
  );
}

/* ================= QUICK ACTION CARD ================= */

function QuickActionCard({
  icon,
  title,
  description,
  color,
  backgroundColor,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor }]}>
        <Ionicons name={icon} size={23} color={color} />
      </View>

      <Text style={styles.quickActionTitle}>{title}</Text>

      <Text style={styles.quickActionDescription}>{description}</Text>

      <View style={styles.quickActionFooter}>
        <Text style={[styles.quickActionLink, { color }]}>Open</Text>

        <Ionicons name="arrow-forward" size={16} color={color} />
      </View>
    </TouchableOpacity>
  );
}

/* ================= FEATURE ITEM ================= */

function FeatureItem({
  icon,
  text,
}: {
  icon: IconName;
  text: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color="#10B981" />
      </View>

      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  contentContainer: {
    paddingBottom: 24,
  },

  hero: {
    minHeight: 245,
    backgroundColor: "#0284C7",
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 90,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
  },

  heroContent: {
    zIndex: 2,
  },

  heroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  heroSmallIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginRight: 8,
  },

  heroLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#BAE6FD",
    letterSpacing: 1.2,
  },

  heroTitle: {
    fontSize: 31,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.7,
    marginBottom: 8,
  },

  heroSubtitle: {
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 21,
    color: "#E0F2FE",
  },

  heroDecoration: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 220,
    height: 220,
  },

  heroCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  circleOne: {
    width: 220,
    height: 220,
    top: -100,
    right: -70,
  },

  circleTwo: {
    width: 130,
    height: 130,
    top: -25,
    right: 35,
  },

  heroStar: {
    position: "absolute",
    top: 55,
    right: 48,
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 20,
    marginTop: -62,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  planCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  planIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    marginRight: 12,
  },

  planIdentityText: {
    flex: 1,
  },

  planLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
    marginBottom: 5,
  },

  planName: {
    fontSize: 23,
    fontWeight: "900",
    color: "#0F172A",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  planPricing: {
    marginBottom: 18,
  },

  planAmount: {
    fontSize: 40,
    fontWeight: "900",
    color: "#0284C7",
    letterSpacing: -1,
  },

  planPeriod: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  billingNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 13,
  },

  billingNoticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
  },

  billingText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
  },

  billingDate: {
    fontWeight: "800",
    color: "#0F172A",
  },

  actionsSection: {
    marginBottom: 26,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  actionsContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },

  quickActionCard: {
    width: 154,
    minHeight: 178,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  quickActionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  quickActionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 5,
  },

  quickActionDescription: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  quickActionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  quickActionLink: {
    fontSize: 12,
    fontWeight: "900",
  },

  featuresCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  checkHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
  },

  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    paddingRight: 8,
  },

  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCFCE7",
    marginRight: 8,
  },

  featureText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  alertCardDanger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  alertIconDanger: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    marginRight: 11,
  },

  alertContent: {
    flex: 1,
    marginRight: 10,
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#991B1B",
    marginBottom: 4,
  },

  alertMessage: {
    fontSize: 12,
    lineHeight: 17,
    color: "#7F1D1D",
  },

  alertButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
  },

  alertButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  alertCardWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  alertIconWarning: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    marginRight: 11,
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#92400E",
    marginBottom: 4,
  },

  warningMessage: {
    fontSize: 12,
    lineHeight: 17,
    color: "#78350F",
  },

  warningDate: {
    fontWeight: "900",
  },

  bottomSpace: {
    height: 20,
  },
});
