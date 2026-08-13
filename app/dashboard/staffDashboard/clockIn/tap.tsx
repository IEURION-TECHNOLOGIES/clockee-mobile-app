import React, { useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { useRouter } from "expo-router";

import { clockIn } from "@/services/clockServices";
import ResponseModal from "@/components/ResponseModal";
import { useAuth } from "@/context/AuthContext";

const OFFLINE_KEY = "offline_clockins";

type ModalType = "success" | "error" | "info";

export default function TapClockScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [modalVisible, setModalVisible] =
    useState(false);

  const [modalType, setModalType] =
    useState<ModalType>("info");

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingMessage, setLoadingMessage] =
    useState("Preparing clock-in...");

  const showModal = (
    type: ModalType,
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const saveOfflineClock = async (
    latitude: number,
    longitude: number
  ) => {
    const existing = await AsyncStorage.getItem(
      OFFLINE_KEY
    );

    const storage = existing
      ? JSON.parse(existing)
      : { offlineLogs: [] };

    if (!Array.isArray(storage.offlineLogs)) {
      storage.offlineLogs = [];
    }

    const now = new Date();
    const timestamp = now.toISOString();
    const dateString = timestamp.slice(0, 10);

    const sequence = String(
      storage.offlineLogs.length + 1
    ).padStart(3, "0");

    const randomId =
      Crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random()}`;

    const offlinePayload = {
      syncId: `clockin-${
        user?.id || "unknown"
      }-${dateString}-${sequence}-${randomId}`,

      actionType: "clock-in",
      timestamp,
      offlineCreatedAt: timestamp,

      userId: user?.id || null,
      branchId:
        user?.branchId ||
        user?.institutionId ||
        null,

      gps: {
        lat: Number(latitude.toFixed(6)),
        lng: Number(longitude.toFixed(6)),
      },

      deviceInfo: `${Platform.OS} ${
        Platform.Version || ""
      }`,

      mode: "offline",
    };

    storage.offlineLogs.push(offlinePayload);

    await AsyncStorage.setItem(
      OFFLINE_KEY,
      JSON.stringify(storage)
    );
  };

  const captureAndClock = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setLoadingMessage("Checking location permission...");

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        showModal(
          "error",
          "Location permission required",
          "Location permission is required to verify your attendance. Please enable it in your device settings and try again."
        );

        return;
      }

      setLoadingMessage("Verifying your location...");

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

      const latitude = Number(
        location.coords.latitude.toFixed(6)
      );

      const longitude = Number(
        location.coords.longitude.toFixed(6)
      );

      setLoadingMessage("Checking network connection...");

      const network = await NetInfo.fetch();

      if (network.isConnected === true) {
        setLoadingMessage("Recording your clock-in...");

        const response = await clockIn(
          latitude,
          longitude
        );

        showModal(
          "success",
          "Clock-in successful",
          response?.data?.message ||
            "Your attendance has been recorded successfully."
        );

        return;
      }

      setLoadingMessage("Saving clock-in offline...");

      await saveOfflineClock(
        latitude,
        longitude
      );

      showModal(
        "info",
        "Saved offline",
        "Your clock-in has been saved on this device and will sync automatically when your connection returns."
      );
    } catch (error: any) {
      console.error(
        "[TapClockScreen] Clock-in error:",
        error?.response?.data || error?.message
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to complete clock-in. Please try again.";

      const isOutsideBranch =
        errorMessage
          .toLowerCase()
          .includes("outside branch radius") ||
        error?.response?.status === 403;

      if (isOutsideBranch) {
        const distance =
          errorMessage.match(/\d+/)?.[0];

        showModal(
          "error",
          "Outside branch area",
          distance
            ? `You are approximately ${distance} meters outside the allowed branch radius. Please move closer to your branch and try again.`
            : "You are outside the allowed branch radius. Please move closer to your branch and try again."
        );

        return;
      }

      showModal(
        "error",
        "Clock-in unsuccessful",
        errorMessage
      );
    } finally {
      setLoading(false);
      setLoadingMessage("Preparing clock-in...");
    }
  };

  const closeResponseModal = () => {
    setModalVisible(false);

    if (modalType === "success") {
      router.replace(
        "/dashboard/staffDashboard/clockIn/success"
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerEyebrow}>
              ATTENDANCE
            </Text>

            <Text style={styles.headerTitle}>
              Tap to clock in
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="finger-print-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* MAIN CONTENT */}

        <View style={styles.content}>
          <View style={styles.introBlock}>
            <Text style={styles.introTitle}>
              Verify your presence
            </Text>

            <Text style={styles.introText}>
              Tap the button below to securely record your attendance at your current location.
            </Text>
          </View>

          {/* LOCATION STATUS */}

          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Ionicons
                name="location-outline"
                size={22}
                color={COLORS.success}
              />
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationTitle}>
                Location verification
              </Text>

              <Text style={styles.locationText}>
                Your location will be checked before clock-in.
              </Text>
            </View>

            <View style={styles.readyBadge}>
              <View style={styles.readyDot} />

              <Text style={styles.readyText}>
                READY
              </Text>
            </View>
          </View>

          {/* TAP ACTION */}

          <View style={styles.tapSection}>
            <Text style={styles.tapSectionTitle}>
              Ready when you are
            </Text>

            <Text style={styles.tapSectionSubtitle}>
              Press and hold your focus on the button
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tap to clock in"
              style={({ pressed }) => [
                styles.tapButton,
                pressed && styles.tapButtonPressed,
                loading && styles.tapButtonDisabled,
              ]}
              onPress={captureAndClock}
              disabled={loading}
            >
              <View style={styles.tapOuterRing}>
                <View style={styles.tapMiddleRing}>
                  <View style={styles.tapInnerCircle}>
                    {loading ? (
                      <ActivityIndicator
                        size="large"
                        color={COLORS.white}
                      />
                    ) : (
                      <Ionicons
                        name="finger-print"
                        size={62}
                        color={COLORS.white}
                      />
                    )}
                  </View>
                </View>
              </View>
            </Pressable>

            <Text style={styles.tapButtonLabel}>
              {loading
                ? "Processing..."
                : "Tap to clock in"}
            </Text>

            <Text style={styles.tapHint}>
              Your clock-in will be recorded securely
            </Text>
          </View>

          {/* STEPS */}

          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>
              How it works
            </Text>

            <StepRow
              number="1"
              icon="location-outline"
              title="Allow location access"
              description="We use your location to verify that you are at the correct branch."
            />

            <StepRow
              number="2"
              icon="finger-print-outline"
              title="Tap the clock-in button"
              description="Your attendance request will be securely submitted."
            />

            <StepRow
              number="3"
              icon="checkmark-circle-outline"
              title="Wait for confirmation"
              description="You will receive a confirmation once your clock-in is complete."
              last
            />
          </View>

          {/* SECURITY NOTE */}

          <View style={styles.securityNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={COLORS.success}
            />

            <Text style={styles.securityText}>
              Your attendance data is protected and only used for workplace verification.
            </Text>
          </View>
        </View>

        {/* LOADING MODAL */}

        <Modal
          visible={loading}
          transparent
          animationType="fade"
          onRequestClose={() => undefined}
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <View style={styles.loadingIcon}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.loadingTitle}>
                Recording attendance
              </Text>

              <Text style={styles.loadingMessage}>
                {loadingMessage}
              </Text>

              <View style={styles.loadingProgressTrack}>
                <View
                  style={styles.loadingProgress}
                />
              </View>

              <Text style={styles.loadingHint}>
                Please keep the app open
              </Text>
            </View>
          </View>
        </Modal>

        {/* RESPONSE MODAL */}

        <ResponseModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={closeResponseModal}
        />
      </View>
    </SafeAreaView>
  );
}

function StepRow({
  number,
  icon,
  title,
  description,
  last = false,
}: {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.stepRow,
        !last && styles.stepBorder,
      ]}
    >
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>
          {number}
        </Text>
      </View>

      <View style={styles.stepIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>
          {title}
        </Text>

        <Text style={styles.stepDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

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
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  headerTitle: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  introBlock: {
    marginTop: 5,
  },

  introTitle: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
  },

  introText: {
    maxWidth: 340,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  locationIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.successLight,
    borderRadius: 13,
  },

  locationContent: {
    flex: 1,
    marginLeft: 10,
  },

  locationTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  locationText: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
  },

  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.successLight,
    borderRadius: 10,
  },

  readyDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },

  readyText: {
    color: COLORS.success,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  tapSection: {
    alignItems: "center",
    marginTop: 10,
  },

  tapSectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  tapSectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  tapButton: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
    backgroundColor: "#E0F2FE",
    borderRadius: 110,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },

  tapButtonPressed: {
    transform: [{ scale: 0.96 }],
  },

  tapButtonDisabled: {
    opacity: 0.7,
  },

  tapOuterRing: {
    width: 184,
    height: 184,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#BAE6FD",
    borderRadius: 92,
  },

  tapMiddleRing: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 75,
  },

  tapInnerCircle: {
    width: 123,
    height: 123,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: "#7DD3FC",
    borderRadius: 62,
  },

  tapButtonLabel: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  tapHint: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
  },

  stepsCard: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  stepsTitle: {
    marginBottom: 3,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 73,
    paddingVertical: 12,
  },

  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  stepNumber: {
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },

  stepNumberText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  stepIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
  },

  stepContent: {
    flex: 1,
    marginLeft: 10,
  },

  stepTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
  },

  stepDescription: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  securityText: {
    flex: 1,
    marginLeft: 7,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
  },

  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },

  loadingCard: {
    alignItems: "center",
    width: 285,
    padding: 25,
    backgroundColor: COLORS.white,
    borderRadius: 24,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 22,
  },

  loadingTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  loadingMessage: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
  },

  loadingProgressTrack: {
    width: "100%",
    height: 6,
    marginTop: 20,
    overflow: "hidden",
    backgroundColor: "#E0F2FE",
    borderRadius: 6,
  },

  loadingProgress: {
    width: "65%",
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },

  loadingHint: {
    marginTop: 10,
    color: COLORS.subtle,
    fontSize: 9,
  },
});
