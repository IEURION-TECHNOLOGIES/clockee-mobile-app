import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");

export default function QRScannerScreen() {
  const router = useRouter();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [timer, setTimer] = useState(30);

  /* ───────────── CAMERA PERMISSION ───────────── */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  /* ───────────── AUTO RESET TIMER ───────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          setScanned(false); // auto re-enable scanning
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ───────────── AUTO SCAN HANDLER ───────────── */
  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    console.log("QR DATA:", data);

    // simulate QR validation delay
    setTimeout(() => {
      router.replace("/dashboard/staffDashboard/clockIn/location");
    }, 700);
  };

  /* ───────────── PERMISSION STATES ───────────── */
  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
      </View>
    );
  }

  /* ───────────── UI ───────────── */
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code Scanner</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Align the QR code within the frame to clock-in
        </Text>

        {/* CAMERA */}
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />

          <View
            style={[
              styles.frame,
              scanned && { borderColor: "#22C55E" },
            ]}
          />
        </View>

        <Text style={styles.refresh}>
          Code refreshes in 00:{String(timer).padStart(2, "0")}s
        </Text>

        {scanned && (
          <Text style={styles.scannedText}>QR Code detected</Text>
        )}
      </View>
    </View>
  );
}

/* ───────────── STYLES ───────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0EA5E9",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },

  card: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
  },

  cameraWrapper: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
  },

  camera: {
    flex: 1,
  },

  frame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: "#0EA5E9",
    borderRadius: 20,
  },

  refresh: {
    color: "#64748B",
    marginBottom: 10,
    fontSize: 13,
  },

  scannedText: {
    color: "#22C55E",
    fontWeight: "600",
    fontSize: 14,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
