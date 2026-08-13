import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import SubscriptionDashboard from "./SubscriptionDashboard";
import PlanSelectionScreen, {
  Plan,
} from "./PlanSelectionScreen";
import PaymentHistoryScreen from "./PaymentHistoryScreen";
import BillingSettingsScreen from "./BillingSettingsScreen";

import BottomNav from "@/components/BottomNav";
import {
  useOwnerCurrentSubscription,
} from "@/hooks/useOwnerCurrentSubscription";

/* ================= TYPES ================= */

type ScreenType =
  | "dashboard"
  | "plans"
  | "history"
  | "billing";

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
  institution?: {
    id: string;
    name: string;
    type: string;
  } | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status:
    | "paid"
    | "pending"
    | "failed"
    | "refunded";
  plan: string;
  period: {
    start: string;
    end: string;
  };
  downloadUrl?: string;
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

/* ================= DEFAULT ================= */

const EMPTY_SUBSCRIPTION: Subscription = {
  id: undefined,
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
  cancelledAt: null,
  cancelReason: null,
  daysRemaining: 0,
  institution: null,
};

/* ================= MAIN ================= */

export default function SubscriptionScreen() {
  const [currentScreen, setCurrentScreen] =
    useState<ScreenType>("dashboard");

  const {
    data: subscriptionData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOwnerCurrentSubscription();

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>([]);

  const [autoRenew, setAutoRenew] =
    useState(true);

  console.log(
    "OWNER SUBSCRIPTION SCREEN STATE:",
    {
      isLoading,
      isFetching,
      hasData: Boolean(subscriptionData),
      error: error?.message,
    }
  );

  console.log(
    "OWNER CURRENT SUBSCRIPTION:",
    subscriptionData
  );

  const currentSubscription: Subscription =
    subscriptionData
      ? {
          ...subscriptionData,
          id: subscriptionData.id,
          activePlan:
            subscriptionData.activePlan ||
            null,
          planName:
            subscriptionData.planName ||
            null,
          billingCycle:
            subscriptionData.billingCycle ||
            null,
          status:
            subscriptionData.status ||
            null,
          amount: Number(
            subscriptionData.amount || 0
          ),
          currency:
            subscriptionData.currency ||
            "NGN",
          startedAt:
            subscriptionData.startedAt ||
            null,
          currentPeriodEnd:
            subscriptionData.currentPeriodEnd ||
            null,
          cancelAtPeriodEnd: Boolean(
            subscriptionData.cancelAtPeriodEnd
          ),
          trialEndsAt:
            subscriptionData.trialEndsAt ||
            null,
          cancelledAt:
            subscriptionData.cancelledAt ||
            null,
          cancelReason:
            subscriptionData.cancelReason ||
            null,
          daysRemaining:
            subscriptionData.daysRemaining ??
            calculateDaysRemaining(
              subscriptionData.trialEndsAt
            ),
          institution:
            subscriptionData.institution ||
            null,
        }
      : EMPTY_SUBSCRIPTION;

  const handleRetry = async () => {
    try {
      await refetch();
    } catch (retryError) {
      console.error(
        "Subscription retry error:",
        retryError
      );
    }
  };

  const handleSelectPlan = async (
    plan: Plan
  ) => {
    const formattedPrice =
      plan.price === 0
        ? `${plan.currency === "NGN" ? "₦" : "$"}0`
        : `${
            plan.currency === "NGN"
              ? "₦"
              : "$"
          }${plan.price.toLocaleString()}`;

    Alert.alert(
      `Choose ${plan.name}`,
      `${formattedPrice}/${plan.billingCycle}. Continue to payment?`,
      [
        {
          text: "Not now",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            try {
              console.log(
                "PLAN SELECTED:",
                plan
              );

              /*
               * Connect your checkout API here.
               */

              Alert.alert(
                "Checkout started",
                `Your ${plan.name} plan checkout has started.`
              );

              setCurrentScreen("dashboard");

              await refetch();
            } catch (requestError) {
              console.error(
                "Plan selection error:",
                requestError
              );

              Alert.alert(
                "Unable to continue",
                "We could not start the checkout process. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleDownloadInvoice = (
    invoice: Invoice
  ) => {
    Alert.alert(
      "Download invoice",
      `Download ${invoice.invoiceNumber}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Download",
          onPress: () => {
            console.log(
              "DOWNLOAD INVOICE:",
              invoice
            );

            Alert.alert(
              "Invoice ready",
              `${invoice.invoiceNumber} is ready to download.`
            );
          },
        },
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      "Add payment method",
      "The secure payment method flow will open here."
    );
  };

  const handleRemovePaymentMethod = (
    method: PaymentMethod
  ) => {
    if (
      method.isDefault &&
      paymentMethods.length > 1
    ) {
      Alert.alert(
        "Set another default card",
        "Please make another payment method the default before removing this card."
      );

      return;
    }

    Alert.alert(
      "Remove payment method?",
      `Remove the card ending in ${method.last4}?`,
      [
        {
          text: "Keep card",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPaymentMethods(
              (previousMethods) =>
                previousMethods.filter(
                  (paymentMethod) =>
                    paymentMethod.id !==
                    method.id
                )
            );
          },
        },
      ]
    );
  };

  const handleSetDefaultPayment = (
    method: PaymentMethod
  ) => {
    setPaymentMethods(
      (previousMethods) =>
        previousMethods.map(
          (paymentMethod) => ({
            ...paymentMethod,
            isDefault:
              paymentMethod.id === method.id,
          })
        )
    );

    Alert.alert(
      "Default payment updated",
      `Your ${method.brand} card ending in ${method.last4} is now your default payment method.`
    );
  };

  const handleToggleAutoRenew = (
    enabled: boolean
  ) => {
    setAutoRenew(enabled);

    console.log(
      "AUTO RENEW UPDATED:",
      enabled
    );
  };

  const handleCancelSubscription =
    async () => {
      try {
        setAutoRenew(false);

        /*
         * Connect your cancel subscription API here.
         */

        await refetch();

        Alert.alert(
          "Subscription cancelled",
          "Your subscription will remain active until the end of the current billing period."
        );
      } catch (cancelError) {
        console.error(
          "Cancel subscription error:",
          cancelError
        );

        Alert.alert(
          "Cancellation failed",
          "We could not cancel your subscription."
        );
      }
    };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={
          error.message ||
          "We could not load your subscription details."
        }
        onRetry={handleRetry}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {currentScreen === "dashboard" && (
          <SubscriptionDashboard
            subscription={currentSubscription}
            onUpgrade={() =>
              setCurrentScreen("plans")
            }
            onManageBilling={() =>
              setCurrentScreen("billing")
            }
            onViewInvoices={() =>
              setCurrentScreen("history")
            }
          />
        )}

        {currentScreen === "plans" && (
          <PlanSelectionScreen
            subscription={currentSubscription}
            onSelectPlan={handleSelectPlan}
            onBack={() =>
              setCurrentScreen("dashboard")
            }
          />
        )}

        {currentScreen === "history" && (
          <PaymentHistoryScreen
            invoices={invoices}
            onBack={() =>
              setCurrentScreen("dashboard")
            }
            onDownloadInvoice={
              handleDownloadInvoice
            }
          />
        )}

        {currentScreen === "billing" && (
          <BillingSettingsScreen
            subscription={currentSubscription}
            paymentMethods={paymentMethods}
            autoRenew={autoRenew}
            onBack={() =>
              setCurrentScreen("dashboard")
            }
            onAddPaymentMethod={
              handleAddPaymentMethod
            }
            onRemovePaymentMethod={
              handleRemovePaymentMethod
            }
            onSetDefault={
              handleSetDefaultPayment
            }
            onToggleAutoRenew={
              handleToggleAutoRenew
            }
            onCancelSubscription={
              handleCancelSubscription
            }
          />
        )}
      </View>

      {isFetching && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator
            size="small"
            color="#0284C7"
          />

          <Text style={styles.refreshText}>
            Updating subscription...
          </Text>
        </View>
      )}

      <BottomNav dashboardType="owner" />
    </View>
  );
}

/* ================= HELPERS ================= */

function calculateDaysRemaining(
  date: string | null
) {
  if (!date) {
    return 0;
  }

  const endTime =
    new Date(date).getTime();

  const difference =
    endTime - Date.now();

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

/* ================= LOADING ================= */

function LoadingState() {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.stateIcon}>
        <Ionicons
          name="card-outline"
          size={28}
          color="#0284C7"
        />
      </View>

      <ActivityIndicator
        size="large"
        color="#0284C7"
      />

      <Text style={styles.stateTitle}>
        Loading billing details
      </Text>

      <Text
        style={styles.stateDescription}
      >
        Please wait while we load your subscription information.
      </Text>
    </View>
  );
}

/* ================= ERROR ================= */

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.stateContainer}>
      <View
        style={[
          styles.stateIcon,
          styles.errorIcon,
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={30}
          color="#EF4444"
        />
      </View>

      <Text style={styles.stateTitle}>
        Something went wrong
      </Text>

      <Text
        style={styles.stateDescription}
      >
        {message}
      </Text>

      <Pressable
        style={styles.retryButton}
        onPress={onRetry}
      >
        <Text
          style={styles.retryButtonText}
        >
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flex: 1,
  },

  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F8FAFC",
  },

  stateIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 22,
  },

  errorIcon: {
    backgroundColor: "#FEF2F2",
  },

  stateTitle: {
    marginTop: 18,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  stateDescription: {
    maxWidth: 300,
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  retryButton: {
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 13,
    backgroundColor: "#0284C7",
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  refreshIndicator: {
    position: "absolute",
    top: 52,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
  },

  refreshText: {
    marginLeft: 7,
    color: "#0369A1",
    fontSize: 11,
    fontWeight: "700",
  },
});
