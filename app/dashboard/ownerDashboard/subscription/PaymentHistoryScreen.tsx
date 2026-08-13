// PaymentHistoryScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, {
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SubscriptionHistoryItem,
  SubscriptionHistoryStatus,
} from "@/services/superAdminServices";

import {
  useOwnerSubscriptionHistory,
} from "@/hooks/useOwnerSubscriptionHistory";

/* ================= TYPES ================= */

type PaymentHistoryScreenProps = {
  onBack: () => void;
};

/* ================= SCREEN ================= */

export default function PaymentHistoryScreen({
  onBack,
}: PaymentHistoryScreenProps) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [exportingId, setExportingId] =
    useState<string | null>(null);

  const {
    data: historyData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOwnerSubscriptionHistory();

  const subscriptions =
    historyData?.subscriptions || [];

  const institution =
    historyData?.institution || null;

  console.log(
    "[PaymentHistory UI] State:",
    {
      isLoading,
      isFetching,
      institution,
      totalSubscriptions:
        subscriptions.length,
      error: error?.message,
    }
  );

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return subscriptions;
    }

    return subscriptions.filter(
      (subscription) => {
        const plan =
          subscription.plan?.toLowerCase() ||
          "";

        const status =
          subscription.status?.toLowerCase() ||
          "";

        const billingCycle =
          subscription.billingCycle
            ?.toLowerCase() || "";

        return (
          plan.includes(query) ||
          status.includes(query) ||
          billingCycle.includes(query)
        );
      }
    );
  }, [subscriptions, searchQuery]);

  const totalPaid = subscriptions
    .filter(
      (subscription) =>
        subscription.amount > 0 &&
        [
          "active",
          "paid",
        ].includes(subscription.status)
    )
    .reduce(
      (total, subscription) =>
        total + Number(subscription.amount || 0),
      0
    );

  const currency =
    subscriptions[0]?.currency || "NGN";

  const handleShareSubscription = async (
    subscription: SubscriptionHistoryItem
  ) => {
    try {
      setExportingId(subscription.id);

      const html =
        createSubscriptionHtml(
          subscription,
          institution?.name
        );

      const { uri } =
        await Print.printToFileAsync({
          html,
        });

      const canShare =
        await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle:
            "Share subscription record",
          UTI: "com.adobe.pdf",
        });
      } else {
        await Share.share({
          message:
            createSubscriptionText(
              subscription,
              institution?.name
            ),
        });
      }
    } catch (exportError) {
      console.error(
        "[PaymentHistory] Share failed:",
        exportError
      );

      Alert.alert(
        "Share failed",
        "We could not create the subscription PDF."
      );
    } finally {
      setExportingId(null);
    }
  };

  const handleDownloadSubscription = async (
    subscription: SubscriptionHistoryItem
  ) => {
    try {
      setExportingId(subscription.id);

      const html =
        createSubscriptionHtml(
          subscription,
          institution?.name
        );

      const { uri } =
        await Print.printToFileAsync({
          html,
        });

      /*
       * On mobile, the system share sheet allows
       * the user to save the PDF to Files, Drive,
       * WhatsApp, email, or another app.
       */
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle:
          "Save subscription PDF",
        UTI: "com.adobe.pdf",
      });
    } catch (exportError) {
      console.error(
        "[PaymentHistory] Download failed:",
        exportError
      );

      Alert.alert(
        "Download failed",
        "We could not create the subscription PDF."
      );
    } finally {
      setExportingId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#0284C7"
        />

        <Text style={styles.loadingText}>
          Loading subscription history...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#EF4444"
        />

        <Text style={styles.errorTitle}>
          History unavailable
        </Text>

        <Text style={styles.errorText}>
          {error.message ||
            "We could not load your subscription history."}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#0F172A"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Subscription History
            </Text>

            <Text style={styles.subtitle}>
              {institution?.name ||
                "View your plan and trial history"}
            </Text>
          </View>

          {isFetching && (
            <ActivityIndicator
              size="small"
              color="#0284C7"
            />
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              Total Records
            </Text>

            <Text style={styles.summaryValue}>
              {subscriptions.length}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              Total Paid
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(
                totalPaid,
                currency
              )}
            </Text>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#64748B"
          />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search plan or status..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
        >
          {filteredSubscriptions.map(
            (subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                isExporting={
                  exportingId === subscription.id
                }
                onShare={() =>
                  handleShareSubscription(
                    subscription
                  )
                }
                onDownload={() =>
                  handleDownloadSubscription(
                    subscription
                  )
                }
              />
            )
          )}

          {filteredSubscriptions.length ===
            0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-outline"
                size={48}
                color="#94A3B8"
              />

              <Text style={styles.emptyTitle}>
                No subscription records
              </Text>

              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No subscription matches your search."
                  : "No subscription history is available yet."}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ================= SUBSCRIPTION CARD ================= */

function SubscriptionCard({
  subscription,
  isExporting,
  onShare,
  onDownload,
}: {
  subscription: SubscriptionHistoryItem;
  isExporting: boolean;
  onShare: () => void;
  onDownload: () => void;
}) {
  const statusColor =
    getSubscriptionStatusColor(
      subscription.status
    );

  const statusText =
    getSubscriptionStatusText(
      subscription.status
    );

  const isTrial =
    subscription.status === "trialing";

  return (
    <View style={styles.subscriptionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.planIdentity}>
          <View
            style={[
              styles.planIcon,
              {
                backgroundColor:
                  `${statusColor}18`,
              },
            ]}
          >
            <Ionicons
              name={
                isTrial
                  ? "gift-outline"
                  : "card-outline"
              }
              size={24}
              color={statusColor}
            />
          </View>

          <View style={styles.planInfo}>
            <Text style={styles.planName}>
              {isTrial
                ? `${subscription.plan} Free Trial`
                : subscription.plan}
            </Text>

            <Text
              style={styles.recordId}
              numberOfLines={1}
            >
              ID: {subscription.id}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                `${statusColor}18`,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: statusColor,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: statusColor,
              },
            ]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.detailsGrid}>
        <DetailItem
          icon="cash-outline"
          label="Amount"
          value={formatCurrency(
            subscription.amount,
            subscription.currency
          )}
        />

        <DetailItem
          icon="repeat-outline"
          label="Billing cycle"
          value={
            subscription.billingCycle
              ? capitalize(
                  subscription.billingCycle
                )
              : "No billing"
          }
        />

        <DetailItem
          icon="calendar-outline"
          label="Started"
          value={formatDate(
            subscription.startedAt
          )}
        />

        <DetailItem
          icon={
            isTrial
              ? "gift-outline"
              : "calendar-number-outline"
          }
          label={
            isTrial
              ? "Trial ends"
              : "Expires"
          }
          value={formatDate(
            isTrial
              ? subscription.trialEndsAt
              : subscription.expiresAt
          )}
        />
      </View>

      {subscription.cancelledAt && (
        <View style={styles.cancelledNotice}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color="#D97706"
          />

          <Text style={styles.cancelledText}>
            Cancelled on{" "}
            {formatDate(
              subscription.cancelledAt
            )}
          </Text>
        </View>
      )}

      {subscription.cancelReason && (
        <Text style={styles.cancelReason}>
          Reason: {subscription.cancelReason}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.createdText}>
          Created{" "}
          {formatDate(subscription.createdAt)}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShare}
            disabled={isExporting}
            activeOpacity={0.7}
          >
            {isExporting ? (
              <ActivityIndicator
                size="small"
                color="#0284C7"
              />
            ) : (
              <Ionicons
                name="share-social-outline"
                size={17}
                color="#0284C7"
              />
            )}

            <Text style={styles.actionText}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDownload}
            disabled={isExporting}
            activeOpacity={0.7}
          >
            <Ionicons
              name="download-outline"
              size={17}
              color="#0284C7"
            />

            <Text style={styles.actionText}>
              PDF
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ================= DETAIL ITEM ================= */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={15}
          color="#64748B"
        />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text
          style={styles.detailValue}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ================= PDF/TEXT EXPORT ================= */

function createSubscriptionText(
  subscription: SubscriptionHistoryItem,
  institutionName?: string
) {
  const planName =
    subscription.status === "trialing"
      ? `${subscription.plan} Free Trial`
      : subscription.plan;

  return [
    "CLOCKEE SUBSCRIPTION RECORD",
    "",
    institutionName
      ? `Institution: ${institutionName}`
      : "",
    `Plan: ${planName}`,
    `Status: ${getSubscriptionStatusText(
      subscription.status
    )}`,
    `Amount: ${formatCurrency(
      subscription.amount,
      subscription.currency
    )}`,
    `Billing cycle: ${
      subscription.billingCycle
        ? capitalize(
            subscription.billingCycle
          )
        : "No billing"
    }`,
    `Started: ${formatDate(
      subscription.startedAt
    )}`,
    `Trial ends: ${formatDate(
      subscription.trialEndsAt
    )}`,
    `Expires: ${formatDate(
      subscription.expiresAt
    )}`,
    `Record ID: ${subscription.id}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function createSubscriptionHtml(
  subscription: SubscriptionHistoryItem,
  institutionName?: string
) {
  const planName =
    subscription.status === "trialing"
      ? `${subscription.plan} Free Trial`
      : subscription.plan;

  const statusColor =
    getSubscriptionStatusColor(
      subscription.status
    );

  const endLabel =
    subscription.status === "trialing"
      ? "Trial ends"
      : "Expires";

  const endValue =
    subscription.status === "trialing"
      ? subscription.trialEndsAt
      : subscription.expiresAt;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #0F172A;
          }

          .header {
            background: #0284C7;
            color: white;
            padding: 24px;
            border-radius: 14px;
          }

          .brand {
            font-size: 13px;
            letter-spacing: 2px;
            font-weight: bold;
          }

          h1 {
            margin: 18px 0 5px;
            font-size: 26px;
          }

          h2 {
            margin: 0 0 8px;
            font-size: 21px;
          }

          .generated {
            font-size: 12px;
            opacity: 0.9;
          }

          .institution {
            margin-top: 5px;
            font-size: 13px;
            opacity: 0.9;
          }

          .card {
            margin-top: 24px;
            padding: 20px;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
          }

          .status {
            display: inline-block;
            margin: 4px 0 18px;
            padding: 7px 12px;
            color: white;
            background: ${statusColor};
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 13px 0;
            border-bottom: 1px solid #E2E8F0;
          }

          .row:last-child {
            border-bottom: none;
          }

          .label {
            color: #64748B;
            font-size: 13px;
          }

          .value {
            font-weight: bold;
            font-size: 13px;
            text-align: right;
          }

          .footer {
            margin-top: 30px;
            color: #64748B;
            font-size: 11px;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <div class="brand">CLOCKEE</div>

          <h1>
            Subscription Record
          </h1>

          ${
            institutionName
              ? `<div class="institution">
                  ${escapeHtml(
                    institutionName
                  )}
                </div>`
              : ""
          }

          <div class="generated">
            Generated ${formatDate(
              new Date().toISOString()
            )}
          </div>
        </div>

        <div class="card">
          <h2>
            ${escapeHtml(planName)}
          </h2>

          <div class="status">
            ${getSubscriptionStatusText(
              subscription.status
            )}
          </div>

          <div class="row">
            <span class="label">
              Amount
            </span>

            <span class="value">
              ${formatCurrency(
                subscription.amount,
                subscription.currency
              )}
            </span>
          </div>

          <div class="row">
            <span class="label">
              Billing cycle
            </span>

            <span class="value">
              ${
                subscription.billingCycle
                  ? capitalize(
                      subscription.billingCycle
                    )
                  : "No billing"
              }
            </span>
          </div>

          <div class="row">
            <span class="label">
              Started
            </span>

            <span class="value">
              ${formatDate(
                subscription.startedAt
              )}
            </span>
          </div>

          <div class="row">
            <span class="label">
              ${endLabel}
            </span>

            <span class="value">
              ${formatDate(endValue)}
            </span>
          </div>

          <div class="row">
            <span class="label">
              Record ID
            </span>

            <span class="value">
              ${escapeHtml(subscription.id)}
            </span>
          </div>
        </div>

        <div class="footer">
          This is a subscription record generated by Clockee.
        </div>
      </body>
    </html>
  `;
}

/* ================= FORMATTERS ================= */

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(
  amount: number | null | undefined,
  currency: string | null | undefined
) {
  const numericAmount = Number(amount || 0);

  const safeCurrency = currency || "NGN";

  if (safeCurrency === "NGN") {
    return `₦${numericAmount.toLocaleString(
      "en-NG"
    )}`;
  }

  return `${safeCurrency} ${numericAmount.toLocaleString()}`;
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ================= STATUS HELPERS ================= */

function getSubscriptionStatusText(
  status: SubscriptionHistoryStatus
) {
  switch (status) {
    case "trialing":
      return "Trialing";

    case "active":
      return "Active";

    case "past_due":
      return "Payment Failed";

    case "canceled":
    case "cancelled":
      return "Cancelled";

    case "unpaid":
      return "Unpaid";

    case "incomplete":
      return "Incomplete";

    case "inactive":
      return "Inactive";

    case "expired":
      return "Expired";

    case "free":
      return "Free";

    default:
      return "Unknown";
  }
}

function getSubscriptionStatusColor(
  status: SubscriptionHistoryStatus
) {
  switch (status) {
    case "trialing":
      return "#0284C7";

    case "active":
      return "#059669";

    case "past_due":
    case "unpaid":
      return "#DC2626";

    case "canceled":
    case "cancelled":
      return "#D97706";

    case "incomplete":
      return "#EA580C";

    case "inactive":
    case "expired":
      return "#7C3AED";

    case "free":
      return "#64748B";

    default:
      return "#64748B";
  }
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
  },

  errorTitle: {
    marginTop: 14,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  errorText: {
    maxWidth: 280,
    marginTop: 7,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: "#0284C7",
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
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
    marginRight: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
  },

  summaryCard: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    elevation: 2,
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    marginBottom: 6,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },

  summaryValue: {
    color: "#0284C7",
    fontSize: 24,
    fontWeight: "900",
  },

  summaryDivider: {
    width: 1,
    marginHorizontal: 16,
    backgroundColor: "#E2E8F0",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginBottom: 16,
    paddingHorizontal: 15,
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
  },

  searchInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
  },

  listContent: {
    paddingBottom: 35,
  },

  subscriptionCard: {
    marginBottom: 13,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  planIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  planIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    borderRadius: 14,
  },

  planInfo: {
    flex: 1,
  },

  planName: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },

  recordId: {
    maxWidth: 180,
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 9,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  cardDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "#F1F5F9",
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 15,
  },

  detailItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 29,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    backgroundColor: "#F1F5F9",
    borderRadius: 9,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    color: "#94A3B8",
    fontSize: 9,
  },

  detailValue: {
    marginTop: 3,
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
  },

  cancelledNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
  },

  cancelledText: {
    marginLeft: 6,
    color: "#92400E",
    fontSize: 11,
    fontWeight: "700",
  },

  cancelReason: {
    marginTop: 7,
    color: "#92400E",
    fontSize: 11,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },

  createdText: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 10,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 9,
  },

  actionText: {
    marginLeft: 5,
    color: "#0284C7",
    fontSize: 11,
    fontWeight: "800",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyTitle: {
    marginTop: 14,
    color: "#334155",
    fontSize: 15,
    fontWeight: "800",
  },

  emptyText: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
  },
});
