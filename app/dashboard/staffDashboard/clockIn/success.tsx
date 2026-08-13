// ======================= StaffShift.tsx =======================

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Svg, { Circle } from "react-native-svg";

import { useRouter } from "expo-router";

import ResponseModal from "@/components/ResponseModal";
import { useAuth } from "../../../../context/AuthContext";
import { useStaffProgress } from "@/hooks/useStaffProgress";
import { clockOut } from "../../../../services/clockServices";

const OFFLINE_KEY = "offline_clockins";

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

/* ================= SCREEN ================= */

export default function StaffShift() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useStaffProgress();

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [clockingOut, setClockingOut] =
    useState(false);

  const [autoClockingOut, setAutoClockingOut] =
    useState(false);

  const [offline, setOffline] =
    useState(false);

  const [liveWorkedSeconds, setLiveWorkedSeconds] =
    useState(0);

  /*
   * Prevents the automatic clock-out from
   * being triggered multiple times.
   */
  const autoClockOutStarted =
    useRef(false);

  const todayStatus = data?.todayStatus;
  const todayDate = data?.date;
  const schedule = data?.schedule;
  const progress = data?.progress;
  const permissions = data?.permissions;
  const clockActions = data?.clockActions;

  const staff = data?.staff;
  const branch = data?.branch;
  const history = data?.recentHistory || [];

  const firstName = getFirstName(
    staff?.name || user?.name
  );

  const greeting = getGreeting();

  const isScheduledWorkDay =
    todayDate?.isScheduledWorkDay === true;

  const isClockedIn =
    todayStatus?.clockedIn === true;

  const isClockedOut =
    todayStatus?.clockedOut === true;

  const nextAction =
    clockActions?.nextAllowedAction;

  const canClockIn =
    permissions?.canClockIn === true &&
    nextAction === "clock-in";

  const canClockOut =
    permissions?.canClockOut === true &&
    nextAction === "clock-out";

  const isLate =
    isClockedIn &&
    (
      todayStatus?.clockInStatus === "late" ||
      todayStatus?.clockInStatus === "very-late" ||
      Number(todayStatus?.minutesLate || 0) > 0
    );

  const isVeryLate =
    isClockedIn &&
    todayStatus?.clockInStatus ===
      "very-late";

  /*
   * The server remains the source of truth
   * after clock-out.
   */
  const serverWorkedSeconds = Number(
    progress?.workedSeconds ??
      Number(
        todayStatus?.totalWorkedMinutes || 0
      ) * 60
  );

  const expectedSeconds = Number(
    progress?.expectedSeconds ??
      Number(
        todayStatus?.expectedMinutes ??
          schedule?.expectedWorkMinutes ??
          0
      ) * 60
  );

  /*
   * While clocked in, show the live timer.
   * After clock-out, show the server value.
   */
  const workedSeconds = isClockedIn
    ? liveWorkedSeconds
    : serverWorkedSeconds;

  const remainingWorkSeconds = Math.max(
    expectedSeconds - workedSeconds,
    0
  );

  const checkoutRemainingSeconds =
    getSecondsUntilScheduleEnd(
      schedule?.expectedEndTime,
      todayDate?.value
    );

  const percentage =
    expectedSeconds > 0
      ? Math.min(
          Math.max(
            (workedSeconds / expectedSeconds) * 100,
            0
          ),
          100
        )
      : Number(
          progress?.progressPercentage || 0
        );

  const isOvertime =
    expectedSeconds > 0 &&
    workedSeconds > expectedSeconds;

  const progressColor =
    isOvertime
      ? COLORS.purple
      : percentage >= 100
        ? COLORS.success
        : percentage >= 75
          ? "#22C55E"
          : percentage >= 50
            ? "#F59E0B"
            : COLORS.primary;

  const status = useMemo(() => {
    return getStatusView({
      isScheduledWorkDay,
      isClockedIn,
      isClockedOut,
      isLate,
      isVeryLate,
      apiStatus: todayStatus?.status,
    });
  }, [
    isScheduledWorkDay,
    isClockedIn,
    isClockedOut,
    isLate,
    isVeryLate,
    todayStatus?.status,
  ]);

  /* ================= NETWORK ================= */

  useEffect(() => {
    const unsubscribe =
      NetInfo.addEventListener((state) => {
        setOffline(
          state.isConnected !== true
        );
      });

    return unsubscribe;
  }, []);

  /* ================= LIVE TIMER ================= */

  useEffect(() => {
    if (
      !isClockedIn ||
      isClockedOut ||
      !todayStatus?.clockInTime
    ) {
      setLiveWorkedSeconds(
        isClockedOut
          ? serverWorkedSeconds
          : 0
      );

      return;
    }

    const clockInTimestamp =
      new Date(
        todayStatus.clockInTime
      ).getTime();

    if (Number.isNaN(clockInTimestamp)) {
      setLiveWorkedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const actualWorkedSeconds = Math.max(
        Math.floor(
          (Date.now() - clockInTimestamp) / 1000
        ),
        0
      );

      setLiveWorkedSeconds(
        Math.max(
          actualWorkedSeconds,
          serverWorkedSeconds
        )
      );
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    isClockedIn,
    isClockedOut,
    todayStatus?.clockInTime,
    serverWorkedSeconds,
  ]);

  /* ================= OFFLINE CLOCK-OUT ================= */

  const saveOfflineClockOut = async ({
    latitude,
    longitude,
    branchId,
    userId,
    automatic = false,
  }: {
    latitude: number;
    longitude: number;
    branchId?: string;
    userId?: string;
    automatic?: boolean;
  }) => {
    const existing =
      await AsyncStorage.getItem(
        OFFLINE_KEY
      );

    const storage = existing
      ? JSON.parse(existing)
      : { offlineLogs: [] };

    if (!Array.isArray(storage.offlineLogs)) {
      storage.offlineLogs = [];
    }

    const timestamp =
      new Date().toISOString();

    const sequence = String(
      storage.offlineLogs.length + 1
    ).padStart(3, "0");

    storage.offlineLogs.push({
      syncId: `clockout-${
        userId || "unknown"
      }-${timestamp.slice(0, 10)}-${sequence}`,

      actionType: "clock-out",
      timestamp,
      offlineCreatedAt: timestamp,

      userId: userId || null,
      branchId: branchId || null,

      gps: {
        lat: latitude,
        lng: longitude,
      },

      deviceInfo: `${Platform.OS} ${
        Platform.Version || ""
      }`,

      mode: "offline",

      autoClockOut: automatic,
      clockOutReason: automatic
        ? "scheduled_end_time"
        : "manual",
    });

    await AsyncStorage.setItem(
      OFFLINE_KEY,
      JSON.stringify(storage)
    );
  };

  /* ================= CLOCK-OUT HANDLER ================= */

  const handleClockOut = async ({
    automatic = false,
  }: {
    automatic?: boolean;
  } = {}) => {
    if (
      !isClockedIn ||
      isClockedOut ||
      clockingOut ||
      autoClockingOut
    ) {
      return;
    }

    try {
      if (automatic) {
        setAutoClockingOut(true);
      } else {
        setClockingOut(true);
      }

      console.log(
        "[StaffShift] Clock-out started:",
        {
          automatic,
          scheduledEndTime:
            schedule?.expectedEndTime,
        }
      );

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        throw new Error(
          "Location permission is required to clock out."
        );
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

      const latitude = Number(
        currentLocation.coords.latitude.toFixed(6)
      );

      const longitude = Number(
        currentLocation.coords.longitude.toFixed(6)
      );

      const network =
        await NetInfo.fetch();

      if (network.isConnected === true) {
        await clockOut(
          latitude,
          longitude
        );

        console.log(
          "[StaffShift] Clock-out successful:",
          {
            automatic,
            latitude,
            longitude,
          }
        );

        setShowConfirm(false);
        await refetch();

        return;
      }

      await saveOfflineClockOut({
        latitude,
        longitude,
        branchId: branch?.id,
        userId: user?.id,
        automatic,
      });

      console.log(
        "[StaffShift] Clock-out saved offline:",
        {
          automatic,
        }
      );

      setShowConfirm(false);
    } catch (clockOutError: any) {
      console.error(
        "[StaffShift] Clock-out error:",
        clockOutError?.response?.data ||
          clockOutError?.message
      );

      /*
       * Allow automatic clock-out to retry
       * if location or network fails.
       */
      if (automatic) {
        autoClockOutStarted.current = false;
      }
    } finally {
      setClockingOut(false);
      setAutoClockingOut(false);
    }
  };

  /* ================= AUTOMATIC CLOCK-OUT ================= */

  useEffect(() => {
    if (
      !isClockedIn ||
      isClockedOut ||
      !isScheduledWorkDay ||
      !schedule?.expectedEndTime ||
      autoClockOutStarted.current
    ) {
      return;
    }

    const checkScheduledCheckout = () => {
      const endTimestamp =
        getScheduleEndTimestamp(
          schedule.expectedEndTime,
          todayDate?.value
        );

      if (!endTimestamp) {
        return;
      }

      const now = Date.now();

      if (now >= endTimestamp) {
        autoClockOutStarted.current = true;

        console.log(
          "[StaffShift] Schedule end reached. Starting automatic clock-out."
        );

        handleClockOut({
          automatic: true,
        });
      }
    };

    /*
     * Run immediately in case the screen
     * opens after the scheduled end time.
     */
    checkScheduledCheckout();

    /*
     * Continue checking while the screen
     * remains open.
     */
    const interval = setInterval(
      checkScheduledCheckout,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    isClockedIn,
    isClockedOut,
    isScheduledWorkDay,
    schedule?.expectedEndTime,
    todayDate?.value,
    handleClockOut,
  ]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading your shift...
        </Text>
      </View>
    );
  }

  /* ================= ERROR ================= */

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={46}
          color={COLORS.danger}
        />

        <Text style={styles.errorTitle}>
          Unable to load shift
        </Text>

        <Text style={styles.errorText}>
          {error?.message ||
            "Please try again."}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
            <Pressable
              style={styles.backButton}
              onPress={goBack}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.headerTextBox}>
              <Text style={styles.overline}>
                {todayDate?.day || "TODAY"} ·{" "}
                {formatDate(todayDate?.value)}
              </Text>

              <Text style={styles.title}>
                {greeting}, {firstName}
              </Text>
            </View>
          </View>

          {/* OFFLINE STATUS */}

          {offline && (
            <View style={styles.offlineBanner}>
              <Ionicons
                name="cloud-offline-outline"
                size={20}
                color={COLORS.warning}
              />

              <Text
                style={styles.offlineBannerText}
              >
                Offline mode is active. Supported attendance actions will sync when you reconnect.
              </Text>
            </View>
          )}

          {/* AUTO CLOCK-OUT STATUS */}

          {autoClockingOut && (
            <View style={styles.autoClockOutBanner}>
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />

              <Text style={styles.autoClockOutText}>
                Scheduled checkout reached. Automatically clocking you out...
              </Text>
            </View>
          )}

          {/* STATUS CARD */}

          <View
            style={[
              styles.statusCard,
              {
                backgroundColor:
                  status.background,
              },
            ]}
          >
            <View style={styles.statusTop}>
              <View style={styles.statusTextBox}>
                <Text style={styles.statusLabel}>
                  SHIFT STATUS
                </Text>

                <Text
                  style={[
                    styles.statusTitle,
                    {
                      color: status.color,
                    },
                  ]}
                >
                  {status.title}
                </Text>

                <Text
                  style={styles.statusDescription}
                >
                  {status.description}
                </Text>
              </View>

              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor: `${status.color}18`,
                  },
                ]}
              >
                <Ionicons
                  name={status.icon}
                  size={30}
                  color={status.color}
                />
              </View>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem
                icon="log-in-outline"
                label="Clock in"
                value={formatTime(
                  todayStatus?.clockInTime
                )}
              />

              <InfoItem
                icon="log-out-outline"
                label="Clock out"
                value={formatTime(
                  todayStatus?.clockOutTime
                )}
              />

              <InfoItem
                icon="time-outline"
                label="Worked"
                value={formatDuration(
                  workedSeconds
                )}
              />

              <InfoItem
                icon="flag-outline"
                label="Expected"
                value={formatDuration(
                  expectedSeconds
                )}
              />
            </View>
          </View>

          {/* PROGRESS */}

          <View style={styles.donutCard}>
            <View style={styles.donutText}>
              <Text style={styles.sectionTitle}>
                Today's progress
              </Text>

              <Text style={styles.sectionSubtitle}>
                {isOvertime
                  ? `Overtime +${formatDuration(
                      workedSeconds -
                        expectedSeconds
                    )}`
                  : `${formatDuration(
                      remainingWorkSeconds
                    )} work remaining`}
              </Text>

              <View style={styles.progressDetails}>
                <Text style={styles.progressDetailText}>
                  Actual worked:{" "}
                  {formatDuration(workedSeconds)}
                </Text>

                <Text style={styles.progressDetailText}>
                  Time until scheduled checkout:{" "}
                  {formatDuration(
                    checkoutRemainingSeconds
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.livePill,
                  {
                    backgroundColor:
                      isClockedIn
                        ? COLORS.successLight
                        : "#F1F5F9",
                  },
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    {
                      backgroundColor:
                        isClockedIn
                          ? COLORS.success
                          : COLORS.muted,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.liveText,
                    {
                      color:
                        isClockedIn
                          ? COLORS.success
                          : COLORS.muted,
                    },
                  ]}
                >
                  {isClockedIn
                    ? "Live tracking"
                    : isClockedOut
                      ? "Shift closed"
                      : "Not started"}
                </Text>
              </View>
            </View>

            <DonutChart
              percentage={percentage}
              color={progressColor}
              centerText={`${Math.round(
                percentage
              )}%`}
              bottomText={
                isOvertime
                  ? "OVERTIME"
                  : "COMPLETE"
              }
            />
          </View>

          {/* ACTION BUTTONS */}

          {canClockIn && (
            <Pressable
              style={styles.clockInButton}
              onPress={() =>
                router.push(
                  "/dashboard/staffDashboard/clockIn/clockIn"
                )
              }
            >
              <Ionicons
                name="log-in-outline"
                size={20}
                color={COLORS.white}
              />

              <Text style={styles.buttonText}>
                Clock in
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={COLORS.white}
              />
            </Pressable>
          )}

          {canClockOut && (
            <Pressable
              style={styles.clockOutButton}
              disabled={
                clockingOut ||
                autoClockingOut
              }
              onPress={() =>
                setShowConfirm(true)
              }
            >
              {clockingOut ? (
                <ActivityIndicator
                  color={COLORS.white}
                />
              ) : (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={COLORS.white}
                  />

                  <Text style={styles.buttonText}>
                    Clock out
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {!canClockIn &&
            !canClockOut &&
            (isClockedOut ||
              todayStatus?.shiftCompleted) && (
              <View
                style={styles.completedBanner}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={COLORS.success}
                />

                <Text
                  style={styles.completedText}
                >
                  Shift completed for today
                </Text>
              </View>
            )}

          {/* SCHEDULE */}

          <SectionHeader
            title="Schedule"
            subtitle={schedule?.name}
          />

          <View style={styles.card}>
            <DetailRow
              icon="calendar-outline"
              label="Work days"
              value={formatWorkDays(
                schedule?.workDays
              )}
            />

            <DetailRow
              icon="time-outline"
              label="Shift time"
              value={`${schedule?.expectedStartTime || "--"} - ${
                schedule?.expectedEndTime || "--"
              }`}
            />

            <DetailRow
              icon="hourglass-outline"
              label="Expected work"
              value={formatMinutes(
                schedule?.expectedWorkMinutes
              )}
            />

            <DetailRow
              icon="timer-outline"
              label="Grace period"
              value={`${schedule?.gracePeriodMinutes || 0} minutes`}
              last
            />
          </View>

          {/* ATTENDANCE DETAILS */}

          <SectionHeader
            title="Attendance details"
            subtitle="Server-calculated information"
          />

          <View style={styles.card}>
            <DetailRow
              icon="person-outline"
              label="Attendance status"
              value={formatStatus(
                todayStatus?.status
              )}
            />

            <DetailRow
              icon="alert-circle-outline"
              label="Late minutes"
              value={
                isLate
                  ? `${todayStatus?.minutesLate || 0} minutes`
                  : "On time"
              }
            />

            <DetailRow
              icon="location-outline"
              label="Location verification"
              value={
                branch?.locationVerificationRequired
                  ? "Required"
                  : "Not required"
              }
            />

            <DetailRow
              icon="server-outline"
              label="Calculation"
              value={
                progress?.serverCalculated
                  ? "Server calculated"
                  : "Device calculated"
              }
              last
            />
          </View>

          {/* RECENT HISTORY */}

          <View style={styles.historySectionHeader}>
            <View>
              <Text style={styles.sectionHeaderTitle}>
                Recent attendance
              </Text>

              <Text style={styles.sectionHeaderSubtitle}>
                Latest shift records
              </Text>
            </View>

            <Pressable
              style={styles.viewAllButton}
              onPress={() =>
                router.push(
                  "/dashboard/staffDashboard/clockIn/history"
                )
              }
            >
              <Text style={styles.viewAllText}>
                View all
              </Text>

              <Ionicons
                name="arrow-forward"
                size={15}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          <View style={styles.card}>
            {history.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="calendar-outline"
                  size={32}
                  color={COLORS.muted}
                />

                <Text style={styles.emptyText}>
                  No recent attendance records
                </Text>
              </View>
            ) : (
              history
                .slice(0, 5)
                .map((record) => (
                  <HistoryRow
                    key={record.id}
                    record={record}
                  />
                ))
            )}
          </View>
        </ScrollView>
      </View>

      <ResponseModal
        visible={showConfirm}
        type="error"
        title="Confirm clock-out"
        message={
          offline
            ? "You are offline. This clock-out will be saved locally and synced later."
            : "Are you sure you want to clock out?"
        }
        onClose={() =>
          setShowConfirm(false)
        }
        onConfirm={() =>
          handleClockOut({
            automatic: false,
          })
        }
        confirmText={
          offline
            ? "Save offline"
            : "Yes, clock out"
        }
      />
    </SafeAreaView>
  );
}

/* ================= DONUT ================= */

function DonutChart({
  percentage,
  color,
  centerText,
  bottomText,
}: {
  percentage: number;
  color: string;
  centerText: string;
  bottomText: string;
}) {
  const size = 145;
  const strokeWidth = 15;
  const radius = 55;
  const center = size / 2;
  const circumference =
    2 * Math.PI * radius;

  const safePercentage = Math.min(
    Math.max(percentage, 0),
    100
  );

  const dashOffset =
    circumference *
    (1 - safePercentage / 100);

  return (
    <View style={styles.donutWrapper}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />

        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View style={styles.donutCenter}>
        <Text
          style={[
            styles.donutPercentage,
            {
              color,
            },
          ]}
        >
          {centerText}
        </Text>

        <Text style={styles.donutLabel}>
          {bottomText}
        </Text>
      </View>
    </View>
  );
}

/* ================= COMPONENTS ================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <Ionicons
        name={icon}
        size={16}
        color={COLORS.muted}
      />

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>
        {title}
      </Text>

      {subtitle && (
        <Text style={styles.sectionHeaderSubtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && styles.rowBorder,
      ]}
    >
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function HistoryRow({
  record,
}: {
  record: any;
}) {
  const historyStatus =
    record.clockIn?.status ||
    record.status;

  const color =
    getHistoryColor(historyStatus);

  return (
    <View style={styles.historyRow}>
      <View
        style={[
          styles.historyIcon,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={17}
          color={color}
        />
      </View>

      <View style={styles.historyContent}>
        <Text style={styles.historyDate}>
          {formatDate(record.date)}
        </Text>

        <Text style={styles.historyTime}>
          In: {formatTime(record.clockIn?.time)}
          {"  "}Out:{" "}
          {formatTime(record.clockOut?.time)}
        </Text>
      </View>

      <Text
        style={[
          styles.historyStatus,
          {
            color,
          },
        ]}
      >
        {formatStatus(historyStatus)}
      </Text>
    </View>
  );
}

/* ================= STATUS ================= */

function getStatusView({
  isScheduledWorkDay,
  isClockedIn,
  isClockedOut,
  isLate,
  isVeryLate,
  apiStatus,
}: {
  isScheduledWorkDay: boolean;
  isClockedIn: boolean;
  isClockedOut: boolean;
  isLate: boolean;
  isVeryLate: boolean;
  apiStatus?: string | null;
}) {
  if (!isScheduledWorkDay) {
    return {
      title: "Day off",
      description:
        "You are not scheduled to work today.",
      color: COLORS.muted,
      background: "#F1F5F9",
      icon: "moon-outline" as const,
    };
  }

  if (isClockedOut) {
    return {
      title: "Shift completed",
      description:
        "You have completed today's shift.",
      color: COLORS.success,
      background: COLORS.successLight,
      icon: "checkmark-circle-outline" as const,
    };
  }

  if (isClockedIn && isVeryLate) {
    return {
      title: "Working · Very late",
      description:
        "You are currently working after a very late clock-in.",
      color: COLORS.danger,
      background: COLORS.dangerLight,
      icon: "alert-circle-outline" as const,
    };
  }

  if (isClockedIn && isLate) {
    return {
      title: "Working · Late",
      description:
        "You are currently working after a late clock-in.",
      color: COLORS.warning,
      background: COLORS.warningLight,
      icon: "time-outline" as const,
    };
  }

  if (isClockedIn) {
    return {
      title: "Currently working",
      description:
        "Your shift is active and being tracked.",
      color: COLORS.primary,
      background: COLORS.primaryLight,
      icon: "pulse-outline" as const,
    };
  }

  return {
    title: "Not clocked in",
    description:
      "You have not clocked in for today's shift.",
    color: COLORS.danger,
    background: COLORS.dangerLight,
    icon: "log-in-outline" as const,
  };
}

/* ================= HELPERS ================= */

function getFirstName(
  name?: string | null
) {
  return name?.trim().split(" ")[0] || "there";
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatDate(
  value?: string | null
) {
  if (!value) return "--";

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

function formatTime(
  value?: string | null
) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(
  seconds?: number
) {
  const total = Math.max(
    Math.floor(Number(seconds) || 0),
    0
  );

  const hours = Math.floor(total / 3600);

  const minutes = Math.floor(
    (total % 3600) / 60
  );

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatMinutes(
  minutes?: number
) {
  return formatDuration(
    Number(minutes || 0) * 60
  );
}

function formatWorkDays(
  workDays?: string[]
) {
  if (!workDays?.length) {
    return "--";
  }

  return workDays
    .map(
      (day) =>
        day.charAt(0).toUpperCase() +
        day.slice(1)
    )
    .join(", ");
}

function formatStatus(
  value?: string | null
) {
  if (!value) return "--";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getHistoryColor(
  value?: string | null
) {
  switch (value) {
    case "on-time":
      return COLORS.success;

    case "early":
      return "#16A34A";

    case "late":
      return COLORS.warning;

    case "very-late":
      return COLORS.danger;

    default:
      return COLORS.muted;
  }
}

function parseScheduleTime(
  value?: string | null
) {
  if (!value) return null;

  const normalized = value
    .trim()
    .toUpperCase();

  const match = normalized.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    minutes > 59
  ) {
    return null;
  }

  if (meridiem === "PM" && hours < 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  if (hours > 23) {
    return null;
  }

  return {
    hours,
    minutes,
  };
}

function getScheduleEndTimestamp(
  endTime?: string | null,
  dateValue?: string | null
) {
  const parsed = parseScheduleTime(endTime);

  if (!parsed) {
    return null;
  }

  const dateOnly = dateValue
    ? dateValue.slice(0, 10)
    : new Date()
        .toISOString()
        .slice(0, 10);

  const hours = String(
    parsed.hours
  ).padStart(2, "0");

  const minutes = String(
    parsed.minutes
  ).padStart(2, "0");

  /*
   * Uses the device's local timezone.
   * For your users in Nigeria, the device
   * should use Africa/Lagos/WAT.
   */
  const checkout = new Date(
    `${dateOnly}T${hours}:${minutes}:00`
  );

  if (Number.isNaN(checkout.getTime())) {
    return null;
  }

  return checkout.getTime();
}

function getSecondsUntilScheduleEnd(
  endTime?: string | null,
  dateValue?: string | null
) {
  const endTimestamp =
    getScheduleEndTimestamp(
      endTime,
      dateValue
    );

  if (!endTimestamp) {
    return 0;
  }

  return Math.max(
    Math.floor(
      (endTimestamp - Date.now()) / 1000
    ),
    0
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 13,
  },

  errorTitle: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  errorText: {
    marginTop: 7,
    color: COLORS.muted,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },

  retryText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
  },

  headerTextBox: {
    flex: 1,
  },

  overline: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  title: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
  },

  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 14,
  },

  offlineBannerText: {
    flex: 1,
    marginLeft: 8,
    color: "#92400E",
    fontSize: 11,
    lineHeight: 16,
  },

  autoClockOutBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 14,
  },

  autoClockOutText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.primaryDark,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },

  statusCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 22,
  },

  statusTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statusTextBox: {
    flex: 1,
  },

  statusLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  statusTitle: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
  },

  statusDescription: {
    maxWidth: 245,
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  statusIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderRadius: 29,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF99",
  },

  infoItem: {
    width: "50%",
    minHeight: 54,
    paddingVertical: 5,
  },

  infoLabel: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
  },

  infoValue: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  donutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    padding: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  donutText: {
    flex: 1,
    paddingRight: 7,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  progressDetails: {
    marginTop: 12,
    gap: 5,
  },

  progressDetailText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  liveDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 4,
  },

  liveText: {
    fontSize: 9,
    fontWeight: "900",
  },

  donutWrapper: {
    width: 145,
    height: 145,
    alignItems: "center",
    justifyContent: "center",
  },

  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  donutPercentage: {
    fontSize: 23,
    fontWeight: "900",
  },

  donutLabel: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  clockInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
  },

  clockOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: COLORS.danger,
    borderRadius: 14,
  },

  buttonText: {
    marginHorizontal: 8,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    padding: 14,
    backgroundColor: COLORS.successLight,
    borderRadius: 14,
  },

  completedText: {
    marginLeft: 7,
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "800",
  },

  sectionHeader: {
    marginTop: 23,
    marginBottom: 10,
  },

  sectionHeaderTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionHeaderSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
  },

  historySectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 23,
    marginBottom: 10,
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingLeft: 8,
  },

  viewAllText: {
    marginRight: 4,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  card: {
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 59,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  detailIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
  },

  detailLabel: {
    flex: 1,
    marginLeft: 9,
    color: COLORS.muted,
    fontSize: 11,
  },

  detailValue: {
    maxWidth: 180,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  historyIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  historyContent: {
    flex: 1,
    marginLeft: 9,
  },

  historyDate: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  historyTime: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  historyStatus: {
    fontSize: 10,
    fontWeight: "900",
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 125,
  },

  emptyText: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 12,
  },
});
