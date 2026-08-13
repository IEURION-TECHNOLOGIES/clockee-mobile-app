// PlanSelectionScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= TYPES ================= */

export type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  popular?: boolean;
};

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "canceled"
  | "unpaid"
  | "expired"
  | "free"
  | null;

type Subscription = {
  id?: string;
  activePlan: string | null;
  planName: string | null;
  billingCycle:
    | "monthly"
    | "yearly"
    | null;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startedAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  daysRemaining?: number;
};

type PlanSelectionScreenProps = {
  subscription?: Subscription;
  onSelectPlan: (plan: Plan) => void;
  onBack: () => void;
};

type IconName =
  keyof typeof Ionicons.glyphMap;

/* ================= PLANS ================= */

const PLANS: Plan[] = [
  {
    id: "plan_free",
    name: "Free",
    price: 0,
    currency: "NGN",
    billingCycle: "monthly",
    features: [
      "1 Branch",
      "Up to 5 Staff",
      "Basic Attendance",
      "7-day History",
      "Email Support",
    ],
  },
  {
    id: "plan_basic",
    name: "Basic",
    price: 5000,
    currency: "NGN",
    billingCycle: "monthly",
    features: [
      "Up to 3 Branches",
      "Up to 20 Staff",
      "Advanced Attendance",
      "30-day History",
      "Email Support",
      "Export Reports",
    ],
  },
  {
    id: "plan_pro",
    name: "Pro",
    price: 15000,
    currency: "NGN",
    billingCycle: "monthly",
    features: [
      "Up to 10 Branches",
      "Up to 100 Staff",
      "Full Attendance & Payroll",
      "Unlimited History",
      "Priority Support",
      "Custom Reports",
      "API Access",
    ],
    popular: true,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: 50000,
    currency: "NGN",
    billingCycle: "monthly",
    features: [
      "Unlimited Branches",
      "Unlimited Staff",
      "Everything in Pro",
      "Dedicated Support",
      "Custom Integrations",
      "SLA Guarantee",
      "Advanced Analytics",
    ],
  },
];

/* ================= MAIN ================= */

export default function PlanSelectionScreen({
  subscription,
  onSelectPlan,
  onBack,
}: PlanSelectionScreenProps) {
  const isTrialing =
    subscription?.status === "trialing";

  const isPaymentFailed =
    subscription?.status === "past_due" ||
    subscription?.status === "unpaid";

  const isCancelled =
    subscription?.status === "cancelled" ||
    subscription?.status === "canceled";

  const trialDaysRemaining =
    subscription?.daysRemaining ??
    calculateDaysRemaining(
      subscription?.trialEndsAt || null
    );

 const formatPrice = (
  price: number,
  currency: string
) => {
  const symbol =
    currency === "NGN" ? "₦" : "$";

  return `${symbol}${price.toLocaleString()}`;
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#0F172A"
              />
            </TouchableOpacity>

            <View
              style={styles.headerTextWrapper}
            >
              <Text style={styles.headerTitle}>
                Plans & Pricing
              </Text>

              <Text
                style={styles.headerSubtitle}
              >
                Choose what works best for your business
              </Text>
            </View>
          </View>

          {/* HERO */}

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="sparkles"
                size={24}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Choose the right plan
              </Text>

              <Text
                style={styles.heroDescription}
              >
                Upgrade your workspace with powerful attendance, payroll, and reporting tools.
              </Text>

              {isTrialing && (
                <View
                  style={styles.trialBanner}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.trialBannerText}
                  >
                    Your free trial has{" "}
                    {trialDaysRemaining} day
                    {trialDaysRemaining === 1
                      ? ""
                      : "s"}{" "}
                    remaining.
                  </Text>
                </View>
              )}

              {isPaymentFailed && (
                <View
                  style={
                    styles.paymentFailedBanner
                  }
                >
                  <Ionicons
                    name="warning-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.trialBannerText}
                  >
                    Your previous payment failed. Choose a plan to continue.
                  </Text>
                </View>
              )}

              {isCancelled && (
                <View
                  style={
                    styles.paymentFailedBanner
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.trialBannerText}
                  >
                    Your subscription has been cancelled.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* BILLING INFORMATION */}

          <View style={styles.billingRow}>
            <View style={styles.billingIcon}>
              <Ionicons
                name="shield-checkmark"
                size={17}
                color="#059669"
              />
            </View>

            <Text style={styles.billingText}>
              Secure payments. Cancel anytime.
            </Text>
          </View>

          {/* PLAN HEADER */}

          <View style={styles.plansHeader}>
            <Text style={styles.sectionTitle}>
              Select a plan
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Start with a free trial and upgrade anytime
            </Text>
          </View>

          {/* PLANS */}

          <View style={styles.plansContainer}>
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                formatPrice={formatPrice}
                subscription={subscription}
                onSelect={() =>
                  onSelectPlan(plan)
                }
              />
            ))}
          </View>

          {/* FOOTER */}

          <View style={styles.footer}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color="#64748B"
            />

            <Text style={styles.footerText}>
              Your payment information is encrypted and secure.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ================= PLAN CARD ================= */

function PlanCard({
  plan,
  formatPrice,
  subscription,
  onSelect,
}: {
  plan: Plan;
  formatPrice: (
    price: number,
    currency: string
  ) => string;
  subscription?: Subscription;
  onSelect: () => void;
}) {
  const isTrialing =
    subscription?.status === "trialing";

  /*
   * This is the important part:
   *
   * During the trial, plan_free is the
   * user's current plan even if the API says:
   *
   * activePlan: "Standard"
   * planName: "Standard Free Trial"
   */
  const isCurrentTrial =
    isTrialing && plan.id === "plan_free";

  /*
   * For an active paid subscription, match
   * the plan using activePlan or planName.
   */
  const isCurrentPaidPlan =
    subscription?.status === "active" &&
    doesPlanMatchSubscription(
      plan,
      subscription
    );

  const isCurrent =
    isCurrentTrial || isCurrentPaidPlan;

  const isFree =
    plan.id === "plan_free";

  const getPlanIcon = (): IconName => {
    switch (plan.id) {
      case "plan_free":
        return "leaf-outline";

      case "plan_basic":
        return "briefcase-outline";

      case "plan_pro":
        return "rocket-outline";

      case "plan_enterprise":
        return "business-outline";

      default:
        return "card-outline";
    }
  };

  const buttonText = isCurrentTrial
    ? "You are on a Free Trial"
    : isCurrentPaidPlan
    ? "Current Plan"
    : isFree
    ? "Choose Free Plan"
    : `Choose ${plan.name}`;

  const planDescription = isCurrentTrial
    ? "Your active 30-day trial"
    : isFree
    ? "Basic features for getting started"
    : "For growing businesses";

  return (
    <View
      style={[
        styles.planCard,
        plan.popular &&
          styles.popularPlanCard,
        isCurrent &&
          styles.currentPlanCard,
      ]}
    >
      {/* BADGES */}

      {(plan.popular || isCurrent) && (
        <View style={styles.badgesRow}>
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Ionicons
                name="star"
                size={13}
                color="#FFFFFF"
              />

              <Text
                style={styles.popularBadgeText}
              >
                Most Popular
              </Text>
            </View>
          )}

          {isCurrent && (
            <View style={styles.currentBadge}>
              <Ionicons
                name="checkmark-circle"
                size={13}
                color="#FFFFFF"
              />

              <Text
                style={styles.currentBadgeText}
              >
                {isCurrentTrial
                  ? "Current Plan (Trial)"
                  : "Current Plan"}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* PLAN IDENTITY */}

      <View style={styles.planTopRow}>
        <View style={styles.planIdentity}>
          <View
            style={[
              styles.planIcon,
              plan.popular &&
                !isCurrent &&
                styles.popularPlanIcon,
              isCurrent &&
                styles.currentPlanIcon,
            ]}
          >
            <Ionicons
              name={getPlanIcon()}
              size={22}
              color={
                plan.popular && !isCurrent
                  ? "#FFFFFF"
                  : isCurrent
                  ? "#059669"
                  : "#0284C7"
              }
            />
          </View>

          <View style={styles.planNameBox}>
            <Text style={styles.planName}>
              {plan.name}
            </Text>

            <Text
              style={styles.planDescription}
            >
              {planDescription}
            </Text>
          </View>
        </View>
      </View>

      {/* PRICE */}

      <View style={styles.priceRow}>
        <Text style={styles.planPrice}>
          {formatPrice(
            plan.price,
            plan.currency
          )}
        </Text>

        {!isFree && (
          <Text style={styles.planPeriod}>
            /{plan.billingCycle}
          </Text>
        )}
      </View>

      {isFree && (
        <Text style={styles.freePeriod}>
          No credit card required to get started
        </Text>
      )}

      <View style={styles.cardDivider} />

      {/* FEATURES */}

      <Text style={styles.featuresTitle}>
        What's included
      </Text>

      <View style={styles.featuresList}>
        {plan.features.map(
          (feature, index) => (
            <View
              key={`${plan.id}-${index}`}
              style={styles.featureItem}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={
                  plan.popular && !isCurrent
                    ? "#0284C7"
                    : "#10B981"
                }
              />

              <Text
                style={styles.featureText}
              >
                {feature}
              </Text>
            </View>
          )
        )}
      </View>

      {/* ACTION BUTTON */}

      <TouchableOpacity
        style={[
          styles.selectButton,
          plan.popular &&
            !isCurrent &&
            styles.popularSelectButton,
          isCurrent &&
            styles.disabledSelectButton,
        ]}
        onPress={onSelect}
        disabled={isCurrent}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.selectButtonText,
            plan.popular &&
              !isCurrent &&
              styles.popularSelectButtonText,
            isCurrent &&
              styles.disabledSelectButtonText,
          ]}
        >
          {buttonText}
        </Text>

        {!isCurrent && (
          <Ionicons
            name="arrow-forward"
            size={18}
            color={
              plan.popular
                ? "#0284C7"
                : "#FFFFFF"
            }
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

/* ================= HELPERS ================= */

function normalizePlanValue(
  value?: string | null
) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/^plan_/, "")
    .replace(/_free_trial$/, "")
    .replace(/_trial$/, "");
}

function doesPlanMatchSubscription(
  plan: Plan,
  subscription: Subscription
) {
  if (subscription.status !== "active") {
    return false;
  }

  const planId = normalizePlanValue(
    plan.id
  );

  const planName = normalizePlanValue(
    plan.name
  );

  const activePlan = normalizePlanValue(
    subscription.activePlan
  );

  const subscribedPlanName =
    normalizePlanValue(
      subscription.planName
    );

  return (
    planId === activePlan ||
    planName === activePlan ||
    planId === subscribedPlanName ||
    planName === subscribedPlanName
  );
}

function calculateDaysRemaining(
  dateString: string | null
) {
  if (!dateString) {
    return 0;
  }

  const end = new Date(
    dateString
  ).getTime();

  const now = Date.now();

  if (end <= now) {
    return 0;
  }

  return Math.ceil(
    (end - now) /
      (1000 * 60 * 60 * 24)
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    marginTop: 40,
    marginBottom: 10,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
  },

  headerTextWrapper: {
    flex: 1,
  },

  headerTitle: {
    color: "#0F172A",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 20,
    overflow: "hidden",
    backgroundColor: "#0284C7",
    borderRadius: 22,
  },

  heroIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    borderRadius: 17,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    marginBottom: 5,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  heroDescription: {
    color: "#E0F2FE",
    fontSize: 13,
    lineHeight: 19,
  },

  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    borderRadius: 10,
  },

  paymentFailedBanner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#DC2626",
    borderRadius: 10,
  },

  trialBannerText: {
    marginLeft: 6,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  billingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  billingIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    backgroundColor: "#D1FAE5",
    borderRadius: 14,
  },

  billingText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },

  plansHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  plansContainer: {
    paddingTop: 8,
  },

  planCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  popularPlanCard: {
    borderWidth: 2,
    borderColor: "#0284C7",
    shadowColor: "#0284C7",
    shadowOpacity: 0.14,
  },

  currentPlanCard: {
  borderColor: "#10B981",
  borderWidth: 2,
  backgroundColor: "#FFFFFF",
},

  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#0284C7",
    borderRadius: 20,
  },

  popularBadgeText: {
    marginLeft: 5,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#10B981",
    borderRadius: 20,
  },

  currentBadgeText: {
    marginLeft: 5,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  planIdentity: {
    flexDirection: "row",
    alignItems: "center",
  },

  planIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#E0F2FE",
    borderRadius: 15,
  },

  popularPlanIcon: {
    backgroundColor: "#0284C7",
  },

  currentPlanIcon: {
    backgroundColor: "#D1FAE5",
  },

  planNameBox: {
    maxWidth: 245,
  },

  planName: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },

  planDescription: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 20,
  },

  planPrice: {
    color: "#0284C7",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  planPeriod: {
    marginLeft: 5,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },

  freePeriod: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
  },

  cardDivider: {
    height: 1,
    marginVertical: 20,
    backgroundColor: "#E2E8F0",
  },

  featuresTitle: {
    marginBottom: 13,
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  featuresList: {
    marginBottom: 22,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  featureText: {
    flex: 1,
    marginLeft: 10,
    color: "#475569",
    fontSize: 14,
  },

  selectButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#0284C7",
    borderRadius: 13,
  },

  popularSelectButton: {
    backgroundColor: "#E0F2FE",
  },

  disabledSelectButton: {
    backgroundColor: "#E2E8F0",
    opacity: 0.9,
  },

  selectButtonText: {
    marginRight: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  popularSelectButtonText: {
    color: "#0284C7",
  },

  disabledSelectButtonText: {
    marginRight: 0,
    color: "#64748B",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  footerText: {
    marginLeft: 7,
    color: "#64748B",
    fontSize: 12,
  },
});
