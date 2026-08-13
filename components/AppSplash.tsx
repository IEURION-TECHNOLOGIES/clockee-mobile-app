// ======================= SplashScreen.tsx =======================

import React, {
  useEffect,
  useRef,
} from "react";

import {
  Animated,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Svg, {
  Path,
} from "react-native-svg";

const logo = require("../assets/images/splash/clockee_logo.png");

export default function SplashScreen() {
  const { width, height } =
    useWindowDimensions();

  const logoOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.88)
  ).current;

  const contentOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const contentTranslateY = useRef(
    new Animated.Value(18)
  ).current;

  const lineWidth = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 42,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),

        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),

        Animated.timing(lineWidth, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    logoOpacity,
    logoScale,
    contentOpacity,
    contentTranslateY,
    lineWidth,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* CLEAN BRAND BACKGROUND */}

      <LinearGradient
        colors={[
          "#071A36",
          "#0A315D",
          "#0B5277",
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={StyleSheet.absoluteFill}
      />

      {/* SUBTLE BACKGROUND LINES */}

      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={`
            M -120 ${height * 0.2}
            C ${width * 0.2} ${height * 0.4},
              ${width * 0.7} ${height * 0.02},
              ${width + 120} ${height * 0.24}
          `}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={1}
        />

        <Path
          d={`
            M -120 ${height * 0.78}
            C ${width * 0.2} ${height * 0.6},
              ${width * 0.7} ${height * 0.98},
              ${width + 120} ${height * 0.72}
          `}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={1}
        />

        <Path
          d={`
            M ${width * 0.18} ${height}
            C ${width * 0.4} ${height * 0.75},
              ${width * 0.72} ${height * 0.78},
              ${width * 0.98} ${height * 0.52}
          `}
          fill="none"
          stroke="rgba(125,211,252,0.08)"
          strokeWidth={1}
        />
      </Svg>

      {/* TOP BRAND LABEL */}

      <Animated.View
        style={[
          styles.topLabel,
          {
            opacity: contentOpacity,
          },
        ]}
      >
        <Text style={styles.topLabelText}>
          CLOCKEE
        </Text>

        <View style={styles.topLabelDash} />

        <Text style={styles.topLabelCaption}>
          TIME MANAGEMENT
        </Text>
      </Animated.View>

      {/* CENTER BRAND CONTENT */}

      <View
        style={[
          styles.centerContent,
          {
            marginTop:
              height < 700 ? -20 : -40,
          },
        ]}
      >
        {/* LOGO ONLY */}

        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
        >
          <Image
            source={logo}
            resizeMode="contain"
            style={[
              styles.logo,
              {
                width: Math.min(
                  width * 0.58,
                  220
                ),
                height: Math.min(
                  width * 0.58,
                  220
                ),
              },
            ]}
          />
        </Animated.View>

        {/* WORDMARK */}

        <Animated.View
          style={[
            styles.brandContent,
            {
              opacity: contentOpacity,
              transform: [
                {
                  translateY: contentTranslateY,
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>
            Clockee
          </Text>

          <Text style={styles.subtitle}>
            Smart time tracking
          </Text>

          <Animated.View
            style={[
              styles.divider,
              {
                width: lineWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 125],
                }),
              },
            ]}
          />

          <Text style={styles.description}>
            Track time with clarity.
            {"\n"}
            Work smarter every day.
          </Text>
        </Animated.View>
      </View>

      {/* BOTTOM */}

      <Animated.View
        style={[
          styles.bottomContent,
          {
            opacity: contentOpacity,
            transform: [
              {
                translateY: contentTranslateY,
              },
            ],
          },
        ]}
      >
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            Preparing your workspace
          </Text>
        </View>

        <Text style={styles.footerText}>
          SIMPLE · SECURE · SMART
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#071A36",
  },

  topLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 65,
  },

  topLabelText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.8,
  },

  topLabelDash: {
    width: 22,
    height: 1,
    marginHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  topLabelCaption: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    // The actual width and height are
    // provided dynamically above.
  },

  brandContent: {
    alignItems: "center",
    width: "100%",
    marginTop: 24,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 43,
    fontWeight: "900",
    letterSpacing: -1.5,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    color: "#BAE6FD",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2.5,
    textAlign: "center",
    textTransform: "uppercase",
  },

  divider: {
    height: 2,
    marginTop: 22,
    backgroundColor: "#38BDF8",
    borderRadius: 2,
  },

  description: {
    marginTop: 17,
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
  },

  bottomContent: {
    alignItems: "center",
    paddingBottom: 34,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 7,
    height: 7,
    marginRight: 8,
    backgroundColor: "#38BDF8",
    borderRadius: 4,
  },

  statusText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: "600",
  },

  footerText: {
    marginTop: 16,
    color: "rgba(255,255,255,0.32)",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2,
  },
});

