import { StatusBar } from "expo-status-bar";
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* =====================================================
          FULL SCREEN SVG BACKGROUND
      ===================================================== */}

      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <Path
            key={i}
            d={`
              M ${-100 + i * 40} ${height}
              Q ${width / 2} ${height / 2}
              ${width + 100} ${-100 + i * 40}
            `}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
            fill="none"
          />
        ))}
      </Svg>

      {/* =====================================================
          CENTER CONTENT
      ===================================================== */}

      <View style={styles.content}>
        <Image
          source={require("../assets/images/splash/clockee_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Klockee
        </Text>

        <Text style={styles.subtitle}>
          Smart Time Tracking
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    /*
     * Explicitly cover the entire screen.
     */
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "#586A8E",

    justifyContent: "center",
    alignItems: "center",

    zIndex: 99999,

    elevation: 99999,
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    fontSize: 14,
  },
});
