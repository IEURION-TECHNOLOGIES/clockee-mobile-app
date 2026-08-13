import React, { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNav from "@/components/BottomNav";
import { useAuth } from "../../../../context/AuthContext";
import { useClockSummary } from "@/hooks/useClockSummary";
import { useProfile } from "@/hooks/useProfile";

import logo from "../../../../assets/images/splash/clockee_logo.png";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#0284C7",
  primaryDark: "#0369A1",
  primaryLight: "#E0F2FE",
  success: "#047857",
  successLight: "#ECFDF5",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  purple: "#7C3AED",
};

type IconName = keyof typeof Ionicons.glyphMap;

type ClockMethod = {
  label: string;
  description: string;
  route: string;
  icon: IconName;
  color: string;
  background: string;
};

const CLOCK_METHODS: ClockMethod[] = [
  {
    label: "Scan QR code",
    description: "Scan the attendance QR code at your branch.",
    route: "qr",
    icon: "qr-code-outline",
    color: COLORS.primary,
    background: COLORS.primaryLight,
  },
  {
    label: "Use backup code",
    description: "Enter the backup code provided by your supervisor.",
    route: "otp",
    icon: "key-outline",
    color: COLORS.warning,
    background: COLORS.warningLight,
  },
  {
    label: "Tap to clock in",
    description: "Use the tap method if it is available for your account.",
    route: "tap",
    icon: "finger-print-outline",
    color: COLORS.purple,
    background: "#F3E8FF",
  },
];

export default function ClockInScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useClockSummary();

  const { data: profile } = useProfile();

  const safeProfile = profile || {};

  const displayName =
    safeProfile?.name ||
    user?.name ||
    "there";

  const role =
    safeProfile?.role?.[0]
      ?.replace(/[_-]/g, " ")
      ?.replace(/\b\w/g, (letter: string) =>
        letter.toUpperCase()
      ) || "Staff member";

  const todayStatus = data?.todayStatus ?? null;

  const shiftState = useMemo(() => {
    if (isLoading) {
      return "loading";
    }

    if (todayStatus?.clockedOut === true) {
      return "completed";
    }

    if (todayStatus?.clockedIn === true) {
      return "active";
    }

    return "not_started";
  }, [
    isLoading,
    todayStatus?.clockedIn,
    todayStatus?.clockedOut,
  ]);

  const [showMethod, setShowMethod] = useState(false);

  const firstName =
    displayName.trim().split(" ")[0] || "there";

  const isActive = shiftState === "active";
  const isCompleted = shiftState === "completed";

  const statusContent = getShiftStatusContent(
    shiftState
  );

  const goToShift = () => {
    router.push(
      "/dashboard/staffDashboard/clockIn/success"
    );
  };

  const handleMainAction = () => {
    if (isActive || isCompleted) {
      goToShift();
      return;
    }

    setShowMethod(true);
  };

  const handleMethodSelect = (route: string) => {
    setShowMethod(false);

    router.push(
      `/dashboard/staffDashboard/clockIn/${route}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View>
                <Text style={styles.headerEyebrow}>
                  ATTENDANCE
                </Text>

                <Text style={styles.headerTitle}>
                  {isActive
                    ? "Your active shift"
                    : isCompleted
                      ? "Shift completed"
                      : "Start your shift"}
                </Text>
              </View>
            </View>
          </View>

          {/* MAIN STATUS CARD */}

          <View
            style={[
              styles.statusCard,
              {
                backgroundColor:
                  statusContent.background,
                  borderColor:
                    statusContent.border,
              },
            ]}
          >
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor:
                      statusContent.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name={statusContent.icon}
                  size={28}
                  color={statusContent.color}
                />
              </View>

              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        statusContent.color,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: statusContent.color,
                    },
                  ]}
                >
                  {statusContent.badge}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.statusTitle,
                {
                  color: statusContent.color,
                },
              ]}
            >
              {statusContent.title}
            </Text>

            <Text style={styles.statusDescription}>
              {statusContent.description}
            </Text>

            <View style={styles.statusDivider} />

            <View style={styles.statusMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={COLORS.muted}
                />

                <View>
                  <Text style={styles.metaLabel}>
                    Role
                  </Text>

                  <Text style={styles.metaValue}>
                    {role}
                  </Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={COLORS.muted}
                />

                <View>
                  <Text style={styles.metaLabel}>
                    Today
                  </Text>

                  <Text style={styles.metaValue}>
                    {formatDate(new Date())}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* LOADING STATE */}

          {shiftState === "loading" && (
            <View style={styles.loadingCard}>
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />

              <Text style={styles.loadingTitle}>
                Checking your shift
              </Text>

              <Text style={styles.loadingSubtitle}>
                Please wait while we retrieve your attendance status.
              </Text>
            </View>
          )}

          {/* ACTIVE SHIFT */}

          {isActive && (
            <View style={styles.actionCard}>
              <View style={styles.actionTop}>
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor:
                        COLORS.successLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="pulse-outline"
                    size={24}
                    color={COLORS.success}
                  />
                </View>

                <View style={styles.actionTextBox}>
                  <Text style={styles.actionTitle}>
                    Your shift is active
                  </Text>

                  <Text style={styles.actionSubtitle}>
                    Your attendance is currently being tracked.
                  </Text>
                </View>
              </View>

              <Pressable
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: COLORS.success,
                  },
                ]}
                onPress={goToShift}
              >
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={21}
                  color={COLORS.white}
                />

                <Text style={styles.primaryButtonText}>
                  View active shift
                </Text>
              </Pressable>
            </View>
          )}

          {/* NOT STARTED */}

          {shiftState === "not_started" && (
            <View style={styles.actionCard}>
              <View style={styles.actionTop}>
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor:
                        COLORS.primaryLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="log-in-outline"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.actionTextBox}>
                  <Text style={styles.actionTitle}>
                    Ready to start?
                  </Text>

                  <Text style={styles.actionSubtitle}>
                    Choose a clock-in method to begin your shift.
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.primaryButton}
                onPress={handleMainAction}
              >
                <Ionicons
                  name="log-in-outline"
                  size={21}
                  color={COLORS.white}
                />

                <Text style={styles.primaryButtonText}>
                  Clock in now
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.white}
                />
              </Pressable>
            </View>
          )}

          {/* COMPLETED SHIFT */}

          {isCompleted && (
            <View style={styles.actionCard}>
              <View style={styles.actionTop}>
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor:
                        COLORS.successLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={25}
                    color={COLORS.success}
                  />
                </View>

                <View style={styles.actionTextBox}>
                  <Text style={styles.actionTitle}>
                    Shift completed
                  </Text>

                  <Text style={styles.actionSubtitle}>
                    You have already completed today’s shift.
                  </Text>
                </View>
              </View>

              <Pressable
                style={[
                  styles.secondaryButton,
                  {
                    borderColor: COLORS.success,
                  },
                ]}
                onPress={goToShift}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    {
                      color: COLORS.success,
                    },
                  ]}
                >
                  View shift details
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.success}
                />
              </Pressable>
            </View>
          )}

          {/* QUICK INFORMATION */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Clock-in methods
              </Text>

              <Text style={styles.sectionSubtitle}>
                Select an available method to verify your attendance.
              </Text>
            </View>
          </View>

          <View style={styles.methodsPreview}>
            {CLOCK_METHODS.map((method) => (
              <Pressable
                key={method.route}
                style={styles.previewMethod}
                onPress={() => {
                  if (!isActive && !isCompleted) {
                    handleMethodSelect(method.route);
                  }
                }}
                disabled={isActive || isCompleted}
              >
                <View
                  style={[
                    styles.previewIcon,
                    {
                      backgroundColor:
                        method.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={21}
                    color={method.color}
                  />
                </View>

                <Text
                  style={[
                    styles.previewLabel,
                    {
                      opacity:
                        isActive || isCompleted
                          ? 0.5
                          : 1,
                    },
                  ]}
                >
                  {method.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ERROR */}

          {isError && (
            <View style={styles.errorCard}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={COLORS.danger}
                />
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  Unable to update shift status
                </Text>

                <Text style={styles.errorDescription}>
                  Check your connection and try again.
                </Text>

                <Pressable
                  onPress={() => refetch()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>
                    Try again
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* FOOTER NOTE */}

          <View style={styles.securityNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={COLORS.success}
            />

            <Text style={styles.securityText}>
              Your attendance verification is protected and securely recorded.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomNavWrapper}>
          <BottomNav dashboardType="staff" />
        </View>
      </View>

      {/* CLOCK-IN METHOD MODAL */}

      <Modal
        transparent
        visible={showMethod}
        animationType="slide"
        onRequestClose={() => setShowMethod(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowMethod(false)}
          />

          <View style={styles.methodSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  Choose clock-in method
                </Text>

                <Text style={styles.sheetSubtitle}>
                  Select how you want to verify your attendance.
                </Text>
              </View>

              <Pressable
                style={styles.sheetClose}
                onPress={() => setShowMethod(false)}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={COLORS.text}
                />
              </Pressable>
            </View>

            <View style={styles.methodList}>
              {CLOCK_METHODS.map((method) => (
                <Pressable
                  key={method.route}
                  style={styles.methodCard}
                  onPress={() =>
                    handleMethodSelect(
                      method.route
                    )
                  }
                >
                  <View
                    style={[
                      styles.methodIcon,
                      {
                        backgroundColor:
                          method.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={25}
                      color={method.color}
                    />
                  </View>

                  <View style={styles.methodContent}>
                    <Text style={styles.methodTitle}>
                      {method.label}
                    </Text>

                    <Text style={styles.methodDescription}>
                      {method.description}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.subtle}
                  />
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowMethod(false)}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= HELPERS ================= */

function getShiftStatusContent(
  shiftState: string
) {
  if (shiftState === "loading") {
    return {
      title: "Checking shift status",
      description:
        "We are retrieving your latest attendance information.",
      badge: "LOADING",
      icon: "time-outline" as IconName,
      color: COLORS.primary,
      background: COLORS.white,
      border: COLORS.border,
      iconBackground: COLORS.primaryLight,
    };
  }

  if (shiftState === "active") {
    return {
      title: "Shift in progress",
      description:
        "Your shift has started and your attendance is being tracked.",
      badge: "ACTIVE",
      icon: "pulse-outline" as IconName,
      color: COLORS.success,
      background: COLORS.successLight,
      border: "#A7F3D0",
      iconBackground: "#D1FAE5",
    };
  }

  if (shiftState === "completed") {
    return {
      title: "Shift completed",
      description:
        "You have successfully completed today’s attendance.",
      badge: "COMPLETED",
      icon: "checkmark-circle-outline" as IconName,
      color: COLORS.success,
      background: COLORS.successLight,
      border: "#A7F3D0",
      iconBackground: "#D1FAE5",
    };
  }

  return {
    title: "Shift not started",
    description:
      "You have not clocked in yet. Start your shift when you are ready.",
    badge: "NOT STARTED",
    icon: "log-in-outline" as IconName,
    color: COLORS.primary,
    background: COLORS.primaryLight,
    border: "#BAE6FD",
    iconBackground: "#BAE6FD",
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 135,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    paddingBottom: 22,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
  },

  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  headerTitle: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },

  avatar: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 24,
  },

  avatarPlaceholder: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 24,
  },

  greetingBlock: {
    marginBottom: 18,
  },

  greeting: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
  },

  greetingSubtitle: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  statusCard: {
    padding: 19,
    borderWidth: 1,
    borderRadius: 24,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    marginRight: 6,
    borderRadius: 4,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  statusTitle: {
    marginTop: 17,
    fontSize: 23,
    fontWeight: "900",
  },

  statusDescription: {
    maxWidth: 310,
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  statusDivider: {
    height: 1,
    marginTop: 18,
    marginBottom: 15,
    backgroundColor: "#FFFFFFAA",
  },

  statusMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },

  metaLabel: {
    marginLeft: 7,
    color: COLORS.muted,
    fontSize: 9,
  },

  metaValue: {
    marginTop: 2,
    marginLeft: 7,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
  },

  loadingCard: {
    alignItems: "center",
    marginTop: 15,
    padding: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  loadingTitle: {
    marginTop: 11,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },

  loadingSubtitle: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
  },

  actionCard: {
    marginTop: 15,
    padding: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
  },

  actionTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionIcon: {
    width: 49,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },

  actionTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  actionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 53,
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
  },

  primaryButtonText: {
    marginHorizontal: 8,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 53,
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 15,
  },

  secondaryButtonText: {
    marginRight: 8,
    fontSize: 13,
    fontWeight: "900",
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 11,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  methodsPreview: {
    overflow: "hidden",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  previewMethod: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 67,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  previewIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  previewLabel: {
    flex: 1,
    marginLeft: 11,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  errorCard: {
    flexDirection: "row",
    marginTop: 15,
    padding: 14,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 17,
  },

  errorIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "900",
  },

  errorDescription: {
    marginTop: 3,
    color: "#B91C1C",
    fontSize: 10,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  retryButtonText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "900",
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 15,
  },

  securityText: {
    flex: 1,
    marginLeft: 7,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },

  bottomNavWrapper: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },

  methodSheet: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 26,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    marginBottom: 19,
    backgroundColor: COLORS.border,
    borderRadius: 5,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  sheetTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
  },

  sheetSubtitle: {
    maxWidth: 275,
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  sheetClose: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
  },

  methodList: {
    gap: 10,
  },

  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
  },

  methodIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },

  methodContent: {
    flex: 1,
    marginHorizontal: 11,
  },

  methodTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  methodDescription: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 51,
    marginTop: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 15,
  },

  cancelButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },
});
