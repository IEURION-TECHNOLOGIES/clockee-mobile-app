import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useClockSummary } from "@/hooks/useClockSummary";
import { useProfile } from "@/hooks/useProfile";

import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Svg, { Path } from "react-native-svg";
import BottomNav from "@/components/BottomNav";

const { width, height } = Dimensions.get("window");

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
  const role =
    safeProfile?.role?.[0]?.replace("_", " ") || "User";

  const [showMethod, setShowMethod] = useState(false);

  const todayStatus = data?.todayStatus ?? null;

  const shiftState =
    isLoading
      ? "loading"
      : !todayStatus?.clockedIn
      ? "not_started"
      : todayStatus?.clockedIn && !todayStatus?.clockedOut
      ? "active"
      : "completed";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* BACKGROUND SVG */}
        <Svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={StyleSheet.absoluteFill}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Path
              key={i}
              d={`M ${i * 50} 0 Q ${width / 2} ${height / 2} ${width} ${i * 50}`}
              stroke="rgba(0,0,0,0.05)"
              strokeWidth={1}
              fill="none"
            />
          ))}
        </Svg>

        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="time-outline" size={22} color="#111" />
          <Text style={styles.headerTitle}>Clock-in</Text>
        </View>

        {/* SHIFT SECTION */}
        {shiftState === "loading" ? (
          <View style={styles.completedContainer}>
            <ActivityIndicator size="small" color="#0EA5E9" />
            <Text style={{ marginTop: 10 }}>
              Checking shift status...
            </Text>
          </View>
        ) : shiftState === "completed" ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>
              You have completed today's shift
            </Text>

            <TouchableOpacity
              style={styles.viewShiftBtn}
              onPress={() =>
                router.push(
                  "/dashboard/staffDashboard/clockIn/success"
                )
              }
            >
              <Text style={styles.viewShiftText}>
                View Shift
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.welcome}>
              Welcome, {safeProfile?.name}
            </Text>

            <Text style={styles.subText}>
              {shiftState === "active"
                ? "You have an active shift"
                : "Clock-in to start your shift"}
            </Text>

            <Pressable
              style={[
                styles.button,
                {
                  backgroundColor:
                    shiftState === "active"
                      ? "#16A34A"
                      : "#0EA5E9",
                },
              ]}
              onPress={() => {
                if (shiftState === "active") {
                  router.push(
                    "/dashboard/staffDashboard/clockIn/success"
                  );
                } else {
                  setShowMethod(true);
                }
              }}
            >
              <Ionicons
                name={
                  shiftState === "active"
                    ? "play-outline"
                    : "log-in-outline"
                }
                size={18}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                {shiftState === "active"
                  ? "Go to Shift"
                  : "Clock-in"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ERROR BOX */}
        {isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Failed to update shift status.
            </Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* CLOCK METHOD MODAL */}
      <Modal transparent visible={showMethod} animationType="slide">
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>
            Choose Clock-in Method
          </Text>

          {[
            { label: "Scan QR", route: "qr", icon: "qr-code-outline" },
            { label: "Backup Code", route: "otp", icon: "key-outline" },
            { label: "Tap", route: "tap", icon: "finger-print-outline" },
          ].map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.methodBtn}
              onPress={() =>
                router.push(
                  `/dashboard/staffDashboard/clockIn/${item.route}`
                )
              }
            >
              <Ionicons name={item.icon} size={18} />
              <Text style={styles.methodText}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowMethod(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.bottomNavWrapper}>
        <BottomNav dashboardType="staff" />
      </View>
    </SafeAreaView>
  );
}

/* ===============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6EEF3" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
    gap: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  card: {
    marginTop: 60,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
  },

  welcome: { fontSize: 22, fontWeight: "700" },

  subText: {
    color: "#64748B",
    marginBottom: 24,
  },

  button: {
    height: 54,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  completedContainer: {
    marginTop: 120,
    marginHorizontal: 20,
    backgroundColor: "#F1F5F9",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },

  completedText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
    color: "#0F172A",
  },

  viewShiftBtn: {
    backgroundColor: "#64748B",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  viewShiftText: {
    color: "#fff",
    fontWeight: "600",
  },

  errorBox: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 10,
  },

  errorText: {
    color: "#991B1B",
    fontSize: 13,
  },

  retryText: {
    color: "#0EA5E9",
    marginTop: 5,
    fontWeight: "600",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  methodBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  methodText: {
    fontSize: 15,
    fontWeight: "500",
  },

  closeBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    color: "#DC2626",
    fontWeight: "600",
  },

  bottomNavWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
