import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useEffect, useState } from "react";

export default function SecuritySettings() {
  const [institutionId] = useState("inst_001"); // dynamic later
  const [qrToken, setQrToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);

  // 🔥 Simulate backend QR token generation
  const generateDynamicQR = () => {
    const newToken = Math.random().toString(36).substring(2, 12);
    setQrToken(
      `https://yourapp.com/clockin?token=${newToken}`
    );
    setSecondsLeft(60);
  };

  // ⏳ Auto refresh every 60 seconds
  useEffect(() => {
    generateDynamicQR();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          generateDynamicQR();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = () => {
    console.log({ institutionId });
    Alert.alert("Saved", "QR security updated.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Institution QR Security</Text>

      <View style={styles.qrBox}>
        {qrToken ? (
          <>
            <QRCode value={qrToken} size={200} />
            <Text style={styles.timer}>
              Refreshing in {secondsLeft}s
            </Text>
          </>
        ) : null}
      </View>

      {/* Manual Regenerate */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={generateDynamicQR}
      >
        <Text style={styles.secondaryText}>Regenerate QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.primaryText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    flex: 1,
    marginTop: 40,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  qrBox: {
    alignItems: "center",
    marginVertical: 20,
  },
  timer: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  primaryButton: {
    backgroundColor: "#6BAED6",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: "500",
  },
});