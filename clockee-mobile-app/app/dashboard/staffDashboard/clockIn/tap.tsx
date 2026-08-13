import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
 Modal, 
 ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { clockIn } from "@/services/clockServices";
import ResponseModal from "@/components/ResponseModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { useAuth } from "@/context/AuthContext";

const OFFLINE_KEY = "offline_clockins";

export default function TapClockScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "info">("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================== CLOCK IN ====================
  const captureAndClock = async () => {
  if (loading) return; // prevent double tap

  try {
    setLoading(true);
    console.log("👆 Clock process started");

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLoading(false);
      return showModal(
        "error",
        "Permission Denied",
        "Location permission is required."
      );
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const lat = +location.coords.latitude.toFixed(6);
    const lng = +location.coords.longitude.toFixed(6);

    const net = await NetInfo.fetch();

    if (net.isConnected) {
      console.log("🚀 ONLINE MODE");
      const res = await clockIn(lat, lng);

      setLoading(false);

      showModal(
        "success",
        "Clocked In",
        res?.data?.message || "Clock-in successful!"
      );
    } else {
      console.log("📦 OFFLINE MODE");

      await saveOfflineClock(lat, lng);

      setLoading(false);

      showModal(
        "info",
        "Saved Offline",
        "Clock-in saved. Will sync automatically when online."
      );
    }
  } catch (error: any) {
    setLoading(false);

    console.error("❌ Clock error:", error);

    const errorMsg =
      error?.response?.data?.message || error?.message || "";

    if (
      errorMsg.includes("Outside branch radius") ||
      error?.response?.status === 403
    ) {
      const distance = errorMsg.match(/\d+/)?.[0] || "unknown";

      showModal(
        "error",
        "Too Far From Branch",
        `You are ${distance} meters outside the allowed radius.\n\nPlease move closer.`
      );
    } else {
      showModal("error", "Clock Failed", errorMsg || "Please try again.");
    }
  }
};


  console.log("userdata from tap: ", user);

  // ==================== FIXED SAVE FUNCTION ====================
  const saveOfflineClock = async (lat: number, lng: number) => {
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_KEY);
      let data = existing ? JSON.parse(existing) : { offlineLogs: [] };
      if (!data.offlineLogs) data.offlineLogs = [];

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const sequence = String(data.offlineLogs.length + 1).padStart(3, "0");

      const offlinePayload = {
        syncId: `clockin-${user?.id || "unknown"}-${dateStr}-${sequence}`,
        actionType: "clock-in",
        timestamp: now.toISOString(),
        offlineCreatedAt: now.toISOString(),
        branchId: user?.branchId || user?.institutionId, // fallback
        gps: {
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        },
        deviceInfo: `${Platform.OS} ${Platform.Version || ""}`,
        mode: "offline",
      };

      data.offlineLogs.push(offlinePayload);

      await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(data));

      console.log("✅ Offline saved successfully →", offlinePayload.syncId);
    } catch (err) {
      console.error("❌ Failed to save offline clock-in:", err);
    }
  };

  const showModal = (type: "success" | "error" | "info", title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  return (
    <View style={styles.center}>
      <TouchableOpacity
        style={[styles.tapBtn, loading && { opacity: 0.6 }]}
        onPress={captureAndClock}
        disabled={loading}
      >
        <Ionicons name="finger-print" size={50} color="#fff" />
        <Text style={styles.tapText}>Tap to Clock In</Text>
      </TouchableOpacity>

      <ResponseModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalVisible(false);
          if (modalType === "success") {
            router.replace("/dashboard/staffDashboard/clockIn/success");
          }
        }}
      />

      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  tapBtn: {
    backgroundColor: "#0EA5E9",
    padding: 30,
    borderRadius: 120,
    alignItems: "center",
    elevation: 5,
  },
  tapText: {
    marginTop: 10,
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},
loadingBox: {
  backgroundColor: "#fff",
  padding: 25,
  borderRadius: 12,
  alignItems: "center",
  width: 200,
},
loadingText: {
  marginTop: 15,
  fontSize: 14,
  fontWeight: "500",
  color: "#334155",
},
});
