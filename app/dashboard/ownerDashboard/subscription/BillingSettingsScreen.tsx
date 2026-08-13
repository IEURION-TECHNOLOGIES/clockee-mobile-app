import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= TYPES ================= */

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
  daysRemaining?: number;
};

type PaymentMethod = {
  id: string;
  type: "card";
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
};

type BillingSettingsScreenProps = {
  subscription: Subscription;
  paymentMethods?: PaymentMethod[];
  autoRenew?: boolean;
  onBack: () => void;
  onAddPaymentMethod: () => void;
  onRemovePaymentMethod: (
    method: PaymentMethod
  ) => void;
  onSetDefault: (
    method: PaymentMethod
  ) => void;
  onToggleAutoRenew: (
    enabled: boolean
  ) => void;
  onCancelSubscription: () => void;
};

/* ================= DEMO PAYMENT METHODS ================= */

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_1",
    type: "card",
    brand: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "card",
    brand: "mastercard",
    last4: "5555",
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
  },
];

/* ================= MAIN ================= */

export default function BillingSettingsScreen({
  subscription,
  paymentMethods = MOCK_PAYMENT_METHODS,
  autoRenew = true,
  onBack,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefault,
  onToggleAutoRenew,
  onCancelSubscription,
}: BillingSettingsScreenProps) {
  const [
    autoRenewEnabled,
    setAutoRenewEnabled,
  ] = useState(autoRenew);

  const isTrial =
    subscription.status === "trialing";

  const isActive =
    subscription.status === "active";

  const isPaymentFailed =
    subscription.status === "past_due" ||
    subscription.status === "unpaid";

  const isCancelled =
    subscription.status === "cancelled" ||
    subscription.status === "canceled";

  const formatDate = (
    dateString: string | null
  ) => {
    if (!dateString) {
      return "--";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (
    amount: number,
    currency: string
  ) => {
    const symbol =
      currency === "NGN" ? "₦" : "$";

    return `${symbol}${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  const getStatusText = () => {
    if (isTrial) {
      return "Free trial";
    }

    if (isPaymentFailed) {
      return "Payment failed";
    }

    if (isCancelled) {
      return "Cancelled";
    }

    if (isActive) {
      return "Active subscription";
    }

    if (subscription.status === "free") {
      return "Free plan";
    }

    if (subscription.status === "expired") {
      return "Expired";
    }

    return "Inactive";
  };

  const getStatusColor = () => {
    if (isPaymentFailed) {
      return "#FCA5A5";
    }

    if (isCancelled) {
      return "#FDE68A";
    }

    if (isActive || isTrial) {
      return "#86EFAC";
    }

    return "#CBD5E1";
  };

  const getPlanTitle = () => {
    if (isTrial) {
      return (
        subscription.planName ||
        "Standard Free Trial"
      );
    }

    return (
      subscription.planName ||
      "Free Plan"
    );
  };

  const getBillingCycleText = () => {
    if (isTrial) {
      return "30-day trial";
    }

    if (
      subscription.billingCycle ===
      "monthly"
    ) {
      return "Monthly";
    }

    if (
      subscription.billingCycle ===
      "yearly"
    ) {
      return "Yearly";
    }

    return "--";
  };

  const getNextBillingText = () => {
    if (isTrial) {
      if (!subscription.trialEndsAt) {
        return "Trial active";
      }

      return `Trial ends ${formatDate(
        subscription.trialEndsAt
      )}`;
    }

    if (subscription.currentPeriodEnd) {
      if (subscription.cancelAtPeriodEnd) {
        return `Access ends ${formatDate(
          subscription.currentPeriodEnd
        )}`;
      }

      return `Renews ${formatDate(
        subscription.currentPeriodEnd
      )}`;
    }

    return "No upcoming billing";
  };

  const handleToggleAutoRenew = (
    value: boolean
  ) => {
    setAutoRenewEnabled(value);
    onToggleAutoRenew(value);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel subscription?",
      "Your subscription will remain active until the end of the current billing period. You will not be charged again.",
      [
        {
          text: "Keep Subscription",
          style: "cancel",
        },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: onCancelSubscription,
        },
      ]
    );
  };

  const formatExpiry = (
    month: number,
    year: number
  ) => {
    return `${month
      .toString()
      .padStart(2, "0")}/${year
      .toString()
      .slice(-2)}`;
  };

  const getBrandLabel = (
    brand: PaymentMethod["brand"]
  ) => {
    return (
      brand.charAt(0).toUpperCase() +
      brand.slice(1)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
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

          <View style={styles.headerTextWrapper}>
            <Text style={styles.title}>
              Billing Settings
            </Text>

            <Text style={styles.subtitle}>
              Manage your subscription and payments
            </Text>
          </View>
        </View>

        {/* DYNAMIC BILLING OVERVIEW */}

        <View
          style={[
            styles.overviewCard,
            isPaymentFailed &&
              styles.overviewCardFailed,
          ]}
        >
          <View style={styles.overviewTop}>
            <View style={styles.overviewIcon}>
              <Ionicons
                name={
                  isTrial
                    ? "gift-outline"
                    : "card"
                }
                size={24}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.overviewStatus}>
              <View
                style={[
                  styles.activeDot,
                  {
                    backgroundColor:
                      getStatusColor(),
                  },
                ]}
              />

              <Text style={styles.activeText}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          <Text style={styles.overviewTitle}>
            {getPlanTitle()}
          </Text>

          <Text
            style={styles.overviewDescription}
          >
            {isTrial
              ? "You currently have access to your trial features."
              : "Your subscription and payment settings are managed securely."}
          </Text>

          <View style={styles.overviewDetails}>
            <View
              style={styles.overviewDetailItem}
            >
              <Text style={styles.overviewLabel}>
                Amount
              </Text>

              <Text style={styles.overviewValue}>
                {formatAmount(
                  subscription.amount,
                  subscription.currency
                )}
              </Text>
            </View>

            <View style={styles.overviewDivider} />

            <View
              style={styles.overviewDetailItem}
            >
              <Text style={styles.overviewLabel}>
                Billing cycle
              </Text>

              <Text style={styles.overviewValue}>
                {getBillingCycleText()}
              </Text>
            </View>
          </View>

          <View style={styles.nextBillingRow}>
            <Ionicons
              name={
                isTrial
                  ? "gift-outline"
                  : "calendar-outline"
              }
              size={16}
              color="#BAE6FD"
            />

            <Text style={styles.nextBillingText}>
              {getNextBillingText()}
            </Text>
          </View>
        </View>

        {/* AUTO RENEWAL */}

        <View style={styles.section}>
          <SectionHeader
            icon="refresh-outline"
            title="Auto renewal"
            subtitle="Control your recurring payments"
          />

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="repeat-outline"
                size={22}
                color="#0284C7"
              />
            </View>

            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>
                Auto-renew subscription
              </Text>

              <Text
                style={styles.settingDescription}
              >
                Renew automatically at the end of each billing period.
              </Text>
            </View>

            <Switch
              value={autoRenewEnabled}
              onValueChange={
                handleToggleAutoRenew
              }
              trackColor={{
                false: "#CBD5E1",
                true: "#7DD3FC",
              }}
              thumbColor={
                autoRenewEnabled
                  ? "#0284C7"
                  : "#F8FAFC"
              }
              ios_backgroundColor="#CBD5E1"
            />
          </View>

          <View style={styles.noticeRow}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#64748B"
            />

            <Text style={styles.noticeText}>
              {autoRenewEnabled
                ? "Your subscription will renew automatically."
                : "Auto-renewal is turned off for your subscription."}
            </Text>
          </View>
        </View>

        {/* PAYMENT METHODS */}

        <View style={styles.section}>
          <SectionHeader
            icon="wallet-outline"
            title="Payment methods"
            subtitle="Manage cards used for billing"
          />

          {paymentMethods.length === 0 ? (
            <View
              style={styles.emptyPaymentCard}
            >
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="card-outline"
                  size={26}
                  color="#0284C7"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No payment methods
              </Text>

              <Text
                style={styles.emptyDescription}
              >
                Add a payment method to manage your subscription.
              </Text>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                formatExpiry={formatExpiry}
                brandLabel={getBrandLabel(
                  method.brand
                )}
                onSetDefault={() =>
                  onSetDefault(method)
                }
                onRemove={() =>
                  onRemovePaymentMethod(
                    method
                  )
                }
              />
            ))
          )}

          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={onAddPaymentMethod}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add"
              size={20}
              color="#0284C7"
            />

            <Text style={styles.addPaymentText}>
              Add payment method
            </Text>
          </TouchableOpacity>
        </View>

        {/* BILLING INFORMATION */}

        <View style={styles.section}>
          <SectionHeader
            icon="receipt-outline"
            title="Billing information"
            subtitle="Information used on your invoices"
          />

          <View style={styles.infoCard}>
            <InfoRow
              icon="location-outline"
              label="Location"
              value="Lagos, Nigeria"
            />

            <View style={styles.infoDivider} />

            <InfoRow
              icon="mail-outline"
              label="Billing email"
              value="billing@clockee.com"
            />
          </View>

          <TouchableOpacity
            style={styles.editBillingButton}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Edit billing information",
                "Billing information editing will be connected here."
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#0284C7"
            />

            <Text style={styles.editBillingText}>
              Edit billing information
            </Text>
          </TouchableOpacity>
        </View>

        {/* SUBSCRIPTION CONTROL */}

        <View style={styles.section}>
          <SectionHeader
            icon="settings-outline"
            title="Subscription control"
            subtitle="Manage your active subscription"
          />

          <TouchableOpacity
            style={styles.cancelCard}
            onPress={handleCancelSubscription}
            activeOpacity={0.8}
          >
            <View style={styles.cancelIcon}>
              <Ionicons
                name="close-circle-outline"
                size={23}
                color="#EF4444"
              />
            </View>

            <View style={styles.cancelInfo}>
              <Text style={styles.cancelTitle}>
                Cancel subscription
              </Text>

              <Text
                style={styles.cancelDescription}
              >
                Stop future billing while keeping access until your period ends.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>

        {/* SUPPORT */}

        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color="#0284C7"
            />
          </View>

          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>
              Need help?
            </Text>

            <Text style={styles.supportText}>
              Contact support at support@clockee.com
            </Text>
          </View>

          <Ionicons
            name="arrow-forward-outline"
            size={18}
            color="#0284C7"
          />
        </View>

        <Text style={styles.securityText}>
          <Ionicons
            name="lock-closed-outline"
            size={13}
            color="#64748B"
          />{" "}
          Your payment information is encrypted and secure.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= SECTION HEADER ================= */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#0284C7"
        />
      </View>

      <View>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text
          style={styles.sectionSubtitle}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* ================= PAYMENT CARD ================= */

function PaymentMethodCard({
  method,
  formatExpiry,
  brandLabel,
  onSetDefault,
  onRemove,
}: {
  method: PaymentMethod;
  formatExpiry: (
    month: number,
    year: number
  ) => string;
  brandLabel: string;
  onSetDefault: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentTopRow}>
        <View style={styles.paymentIdentity}>
          <View style={styles.paymentIcon}>
            <Ionicons
              name="card-outline"
              size={25}
              color="#0284C7"
            />
          </View>

          <View>
            <View style={styles.brandRow}>
              <Text style={styles.paymentBrand}>
                {brandLabel}
              </Text>

              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>
                    Default
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={styles.paymentNumber}
            >
              •••• •••• •••• {method.last4}
            </Text>
          </View>
        </View>

        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color="#94A3B8"
        />
      </View>

      <View style={styles.paymentDivider} />

      <View style={styles.paymentBottomRow}>
        <View>
          <Text style={styles.expiryLabel}>
            Expires
          </Text>

          <Text style={styles.paymentExpiry}>
            {formatExpiry(
              method.expiryMonth,
              method.expiryYear
            )}
          </Text>
        </View>

        <View style={styles.paymentActions}>
          {!method.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSetDefault}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>
                Make default
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={15}
              color="#EF4444"
            />

            <Text style={styles.removeText}>
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ================= INFO ROW ================= */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#64748B"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoText}>
          {value}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#CBD5E1"
      />
    </View>
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
    backgroundColor: "#F8FAFC",
  },

  contentContainer: {
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

  title: {
    color: "#0F172A",
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  overviewCard: {
    marginBottom: 28,
    padding: 20,
    backgroundColor: "#0284C7",
    borderRadius: 22,
  },

  overviewCardFailed: {
    backgroundColor: "#B91C1C",
  },

  overviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  overviewIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.18)",
    borderRadius: 16,
  },

  overviewStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    marginRight: 6,
    borderRadius: 4,
  },

  activeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  overviewTitle: {
    marginBottom: 6,
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  overviewDescription: {
    color: "#E0F2FE",
    fontSize: 13,
    lineHeight: 19,
  },

  overviewDetails: {
    flexDirection: "row",
    marginTop: 22,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.2)",
  },

  overviewDetailItem: {
    flex: 1,
  },

  overviewDivider: {
    width: 1,
    marginHorizontal: 16,
    backgroundColor:
      "rgba(255,255,255,0.25)",
  },

  overviewLabel: {
    marginBottom: 5,
    color: "#BAE6FD",
    fontSize: 11,
  },

  overviewValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  nextBillingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.2)",
  },

  nextBillingText: {
    marginLeft: 7,
    color: "#E0F2FE",
    fontSize: 12,
    fontWeight: "700",
  },

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionHeaderIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },

  sectionSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
  },

  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
  },

  settingIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#E0F2FE",
    borderRadius: 14,
  },

  settingInfo: {
    flex: 1,
    marginRight: 10,
  },

  settingLabel: {
    marginBottom: 5,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  settingDescription: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
  },

  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 3,
  },

  noticeText: {
    flex: 1,
    marginLeft: 6,
    color: "#64748B",
    fontSize: 12,
  },

  paymentCard: {
    marginBottom: 12,
    padding: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
  },

  paymentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paymentIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  paymentBrand: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  defaultBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
  },

  defaultText: {
    color: "#059669",
    fontSize: 10,
    fontWeight: "800",
  },

  paymentNumber: {
    color: "#64748B",
    fontSize: 13,
  },

  paymentDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "#E2E8F0",
  },

  paymentBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  expiryLabel: {
    marginBottom: 3,
    color: "#94A3B8",
    fontSize: 11,
  },

  paymentExpiry: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },

  paymentActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  actionText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "700",
  },

  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },

  removeText: {
    marginLeft: 5,
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
  },

  addPaymentButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#0284C7",
    borderRadius: 14,
  },

  addPaymentText: {
    marginLeft: 8,
    color: "#0284C7",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyPaymentCard: {
    alignItems: "center",
    marginBottom: 12,
    padding: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#E0F2FE",
    borderRadius: 18,
  },

  emptyTitle: {
    marginBottom: 5,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  emptyDescription: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
  },

  infoCard: {
    paddingHorizontal: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
  },

  infoRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: "#F1F5F9",
    borderRadius: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    marginBottom: 4,
    color: "#94A3B8",
    fontSize: 11,
  },

  infoText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  editBillingButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
  },

  editBillingText: {
    marginLeft: 7,
    color: "#0284C7",
    fontSize: 13,
    fontWeight: "700",
  },

  cancelCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 18,
  },

  cancelIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
  },

  cancelInfo: {
    flex: 1,
    marginRight: 10,
  },

  cancelTitle: {
    marginBottom: 5,
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },

  cancelDescription: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
  },

  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
  },

  supportIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: "#DBEAFE",
    borderRadius: 13,
  },

  supportContent: {
    flex: 1,
  },

  supportTitle: {
    marginBottom: 4,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  supportText: {
    color: "#64748B",
    fontSize: 12,
  },

  securityText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
  },
});
