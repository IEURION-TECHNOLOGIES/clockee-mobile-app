import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
} from "react-native";

import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function SecondDemoScreen() {
  const router = useRouter();

  const handleSkip = async () => {
  try {

    await AsyncStorage.setItem(
      "hasSeenDemo",
      "true"
    );

    DeviceEventEmitter.emit(
      "CLOCKEE_DEMO_COMPLETED"
    );

    console.log(
      "[SecondDemo] Demo completed"
    );

    router.replace(
      "/auth/generalAuth/Login"
    );

  } catch (error) {

    console.error(
      "[SecondDemo] Failed to save demo status:",
      error
    );

  }
};

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* SVG BACKGROUND */}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={StyleSheet.absoluteFill}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Path
            key={i}
            d={`
              M ${-80 + i * 50} ${height}
              Q ${width / 2} ${height / 2}
              ${width + 80} ${-80 + i * 50}
            `}
            stroke="rgba(14, 165, 233, 0.12)"
            strokeWidth={1}
            fill="none"
          />
        ))}
      </Svg>

      {/* TOP CONTENT */}
      <View style={styles.topContent}>
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/images/splash/clockee_logo.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>Clockee</Text>
        </View>

        <Text style={styles.description}>
          Easily clock in to work using QR code scanning for a fast and
          contactless experience.
        </Text>
      </View>

      {/* ILLUSTRATION CARD */}
      <View style={styles.illustrationCard}>
        <View style={styles.illustrationInner}>
          <Image
            source={require("../../assets/images/demo/attendance_two.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* BOTTOM CARD */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>QR Code Scanning</Text>
        <Text style={styles.subtitle}>Quick and contactless check-ins</Text>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/demopage/thirddemo")}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  topContent: {
    marginTop: 70,
    alignItems: "center",
    paddingHorizontal: 28,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.2,
  },
  description: {
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
  },
  illustrationCard: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  illustrationInner: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  illustration: {
    width: "85%",
    height: "85%",
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 22,
    textAlign: "center",
    maxWidth: 260,
  },
  nextButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  skipButton: {
    marginTop: 4,
    paddingVertical: 10,
  },
  skipText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});
