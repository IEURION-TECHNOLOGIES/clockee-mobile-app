// ======================= QRScannerScreen.tsx =======================

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const SCAN_RESET_SECONDS = 30;

const COLORS = {
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
  danger: "#DC2626",
};

export default function QRScannerScreen() {
  const router = useRouter();

  const [hasPermission, setHasPermission] =
    useState<boolean | null>(null);

  const [scanned, setScanned] =
    useState(false);

  const [timer, setTimer] = useState(
    SCAN_RESET_SECONDS
  );

  const scanLineAnimation = useRef(
    new Animated.Value(-95)
  ).current;

  const navigationTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  useEffect(() => {
    requestCameraPermission();

    return () => {
      if (navigationTimeout.current) {
        clearTimeout(
          navigationTimeout.current
        );
      }

      scanLineAnimation.stopAnimation();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission =
        await Camera.requestCameraPermissionsAsync();

      setHasPermission(
        permission.status === "granted"
      );
    } catch (error) {
      console.error(
        "[QRScanner] Camera permission error:",
        error
      );

      setHasPermission(false);
    }
  };

  /*
   * Countdown for refreshing the scanner.
   */
  useEffect(() => {
    if (hasPermission !== true) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((previous) => {
        if (previous <= 1) {
          setScanned(false);
          return SCAN_RESET_SECONDS;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasPermission]);

  /*
   * Animated scan line.
   * The line moves from top to bottom,
   * then returns from bottom to top.
   */
  useEffect(() => {
    scanLineAnimation.stopAnimation();

    if (
      hasPermission !== true ||
      scanned
    ) {
      return;
    }

    scanLineAnimation.setValue(-95);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 95,
          duration: 1800,
          useNativeDriver: true,
        }),

        Animated.timing(scanLineAnimation, {
          toValue: -95,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
      scanLineAnimation.stopAnimation();
    };
  }, [
    hasPermission,
    scanned,
    scanLineAnimation,
  ]);

  const handleScan = ({
    data,
  }: {
    data: string;
  }) => {
    if (scanned) {
      return;
    }

    setScanned(true);

    console.log("[QRScanner] QR data:", data);

    /*
     * Replace this timeout with your real
     * QR validation API call.
     */
    navigationTimeout.current =
      setTimeout(() => {
        router.replace(
          "/dashboard/staffDashboard/clockIn/location"
        );
      }, 850);
  };

  const resetScanner = () => {
    setScanned(false);
    setTimer(SCAN_RESET_SECONDS);
  };

  if (hasPermission === null) {
    return (
      <PermissionState
        icon="camera-outline"
        title="Preparing camera"
        message="Requesting camera access so you can scan your branch QR code."
        loading
        onBack={() => router.back()}
      />
    );
  }

  if (hasPermission === false) {
    return (
      <PermissionState
        icon="camera-outline"
        title="Camera permission required"
        message="Camera access is needed to scan the attendance QR code. Enable permission in your device settings and try again."
        onBack={() => router.back()}
        onRetry={requestCameraPermission}
        onOpenSettings={() =>
          Linking.openSettings()
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.container}>
        {/* CAMERA */}

        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={
            scanned ? undefined : handleScan
          }
        />

        {/* DARK OVERLAY */}

        <View style={styles.darkOverlay} />

        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.white}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerEyebrow}>
              ATTENDANCE
            </Text>

            <Text style={styles.headerTitle}>
              Scan QR code
            </Text>
          </View>

          <View style={styles.headerButton}>
            <Ionicons
              name="qr-code-outline"
              size={21}
              color={COLORS.white}
            />
          </View>
        </View>

        {/* CENTER CONTENT */}

        <View style={styles.centerContent}>
          <View style={styles.instructionBlock}>
            <View style={styles.instructionIcon}>
              <Ionicons
                name="scan-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.title}>
              Scan your branch code
            </Text>

            <Text style={styles.subtitle}>
              Position the QR code inside the frame. Scanning will happen automatically.
            </Text>
          </View>

          {/* SCANNER FRAME */}

          <View style={styles.scannerArea}>
            <View
              style={[
                styles.scannerFrame,
                scanned &&
                  styles.scannerFrameSuccess,
              ]}
            >
              <View
                style={[
                  styles.corner,
                  styles.cornerTopLeft,
                  scanned &&
                    styles.cornerSuccess,
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.cornerTopRight,
                  scanned &&
                    styles.cornerSuccess,
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.cornerBottomLeft,
                  scanned &&
                    styles.cornerSuccess,
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.cornerBottomRight,
                  scanned &&
                    styles.cornerSuccess,
                ]}
              />

              {!scanned && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY:
                            scanLineAnimation,
                        },
                      ],
                    },
                  ]}
                />
              )}

              {scanned && (
                <View style={styles.successOverlay}>
                  <View style={styles.successIcon}>
                    <Ionicons
                      name="checkmark"
                      size={30}
                      color={COLORS.white}
                    />
                  </View>

                  <Text style={styles.successText}>
                    QR code detected
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* STATUS */}

          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons
                name={
                  scanned
                    ? "checkmark-circle-outline"
                    : "scan-outline"
                }
                size={20}
                color={
                  scanned
                    ? COLORS.success
                    : COLORS.primary
                }
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {scanned
                  ? "Code detected"
                  : "Ready to scan"}
              </Text>

              <Text style={styles.statusText}>
                {scanned
                  ? "Validating your attendance code..."
                  : "Move the QR code inside the frame"}
              </Text>
            </View>

            {!scanned && (
              <View style={styles.timerBadge}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={COLORS.primaryDark}
                />

                <Text style={styles.timerText}>
                  {formatTimer(timer)}
                </Text>
              </View>
            )}
          </View>

          {scanned && (
            <Pressable
              style={styles.scanAgainButton}
              onPress={resetScanner}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={COLORS.white}
              />

              <Text style={styles.scanAgainText}>
                Scan again
              </Text>
            </Pressable>
          )}
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color="#BAE6FD"
          />

          <Text style={styles.footerText}>
            Your QR verification is encrypted and securely processed.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ================= PERMISSION STATE ================= */

function PermissionState({
  icon,
  title,
  message,
  loading = false,
  onBack,
  onRetry,
  onOpenSettings,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  loading?: boolean;
  onBack: () => void;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}) {
  return (
    <SafeAreaView style={styles.permissionSafeArea}>
      <StatusBar style="dark" />

      <View style={styles.permissionContainer}>
        <Pressable
          style={styles.permissionBackButton}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />
            ) : (
              <Ionicons
                name={icon}
                size={38}
                color={COLORS.primary}
              />
            )}
          </View>

          <Text style={styles.permissionTitle}>
            {title}
          </Text>

          <Text style={styles.permissionMessage}>
            {message}
          </Text>

          {!loading && onRetry && (
            <Pressable
              style={styles.permissionPrimaryButton}
              onPress={onRetry}
            >
              <Ionicons
                name="refresh-outline"
                size={19}
                color={COLORS.white}
              />

              <Text
                style={styles.permissionPrimaryText}
              >
                Try again
              </Text>
            </Pressable>
          )}

          {!loading && onOpenSettings && (
            <Pressable
              style={styles.permissionSecondaryButton}
              onPress={onOpenSettings}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={COLORS.primary}
              />

              <Text
                style={styles.permissionSecondaryText}
              >
                Open settings
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ================= HELPERS ================= */

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(
    2,
    "0"
  )}`;
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.64)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  headerButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 14,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    color: "#BAE6FD",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  headerTitle: {
    marginTop: 3,
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
  },

  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  instructionBlock: {
    alignItems: "center",
    maxWidth: 320,
  },

  instructionIcon: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 15,
  },

  title: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 7,
    color: "#CBD5E1",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },

  scannerArea: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 29,
  },

  scannerFrame: {
    width: 245,
    height: 245,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 23,
  },

  scannerFrameSuccess: {
    borderColor: "#86EFAC",
  },

  corner: {
    position: "absolute",
    width: 43,
    height: 43,
    borderColor: COLORS.primary,
  },

  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },

  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },

  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },

  cornerBottomRight: {
    right: -2,
    bottom: -2,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 12,
  },

  cornerSuccess: {
    borderColor: "#22C55E",
  },

  scanLine: {
    position: "absolute",
    width: 205,
    height: 3,
    backgroundColor: "#38BDF8",
    borderRadius: 3,
    shadowColor: "#38BDF8",
    shadowOpacity: 0.95,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 5,
  },

  successOverlay: {
    alignItems: "center",
    justifyContent: "center",
  },

  successIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    borderRadius: 29,
  },

  successText: {
    marginTop: 9,
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 25,
    padding: 13,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 17,
  },

  statusIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },

  statusContent: {
    flex: 1,
    marginLeft: 10,
  },

  statusTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  statusText: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 9,
  },

  timerText: {
    marginLeft: 4,
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: "900",
  },

  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 47,
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
  },

  scanAgainText: {
    marginLeft: 7,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 22,
  },

  footerText: {
    marginLeft: 6,
    color: "#CBD5E1",
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
  },

  permissionSafeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  permissionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  permissionBackButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  permissionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  permissionIcon: {
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 28,
  },

  permissionTitle: {
    marginTop: 21,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  permissionMessage: {
    maxWidth: 310,
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  permissionPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 52,
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
  },

  permissionPrimaryText: {
    marginLeft: 7,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  permissionSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 52,
    marginTop: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },

  permissionSecondaryText: {
    marginLeft: 7,
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "900",
  },
});
