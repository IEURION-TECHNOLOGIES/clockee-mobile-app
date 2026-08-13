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
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function FirstDemoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* SVG CLOCK BACKGROUND */}
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
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={1}
            fill="none"
          />
        ))}
      </Svg>

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/splash/clockee_logo.png")}
          style={styles.logo}
        />
        <Text style={styles.appName}>Clockee</Text>

        <Text style={styles.description}>
          A smart time & attendance management for schools and offices. Track
          staff and students attendance with ease
        </Text>
      </View>

      {/* ILLUSTRATION CARD */}
      <View style={styles.illustrationWrapper}>
        <Image
          source={require("../../assets/images/demo/attendance.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* BOTTOM CARD */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Students & Staff tracking</Text>
        <Text style={styles.subtitle}>
          Monitor Classroom attendance in Real-time
        </Text>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/demopage/seconddemo")}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.setItem("hasSeenDemo", "true");

          setTimeout(() => {
            router.replace("/auth/generalAuth/Login");
          }, 50); // 🔥 ensures storage writes before navigation
        }}
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
    backgroundColor: "#E6EEF3",
    alignItems: "center",
  },

  header: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logo: {
    width: 42,
    height: 42,
    marginBottom: 8,
  },

  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  description: {
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },

  illustrationWrapper: {
    marginTop: 30,
    width: width * 0.85,
    height: width * 0.85,
    backgroundColor: "#35A9E0",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
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
    padding: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 20,
    textAlign: "center",
  },

  nextButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#0EA5E9",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  skipText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
  },
});
