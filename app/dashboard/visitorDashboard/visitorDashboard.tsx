import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function VisitorDashboard() {
  const router = useRouter();

  /* Animations */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();

  const onPressOut = () =>
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Image
          source={require("../../../assets/images/splash/clockee_logo.png")}
          style={styles.logo}
        />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Institution Ready</Text>
        </View>

        <Text style={styles.title}>Welcome to Clockee</Text>
        <Text style={styles.subtitle}>
          A modern attendance & workforce time-tracking platform built for
          institutions.
        </Text>
      </Animated.View>

      {/* PRODUCT OVERVIEW */}
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.cardTitle}>Product Overview</Text>

        <View style={styles.featureCard}>
          <Ionicons name="time-outline" size={22} color="#0EA5E9" />
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Smart Attendance</Text>
            <Text style={styles.featureDesc}>
              Automatically record staff and student attendance with accuracy.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="qr-code-outline" size={22} color="#0EA5E9" />
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>QR & Secure Clock-In</Text>
            <Text style={styles.featureDesc}>
              Prevent proxy attendance with secure QR-based verification.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="analytics-outline" size={22} color="#0EA5E9" />
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Reports & Insights</Text>
            <Text style={styles.featureDesc}>
              Get real-time attendance analytics and exportable reports.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* WHY CLOCKEE */}
      <Animated.View
        style={[
          styles.infoCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.infoTitle}>Why Institutions Choose Clockee</Text>
        <Text style={styles.infoText}>
          • Reduces manual attendance errors{"\n"}• Saves administrative time
          {"\n"}• Works for schools, companies & organizations{"\n"}• Scales
          easily with your institution
        </Text>
      </Animated.View>

      {/* ACTIONS */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          style={styles.primaryButton}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => router.push("/auth/visitorAuth/register")}
        >
          <Text style={styles.primaryText}>Request Institution Demo</Text>
        </Pressable>
      </Animated.View>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          router.push("/dashboard/visitorDashboard/VisitorSupport")
        }
      >
        <Text style={styles.secondaryText}>Contact Support</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 26,
  },

  logo: {
    width: 52,
    height: 52,
    marginBottom: 10,
  },

  badge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },

  badgeText: {
    fontSize: 12,
    color: "#0284C7",
    fontWeight: "600",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
    color: "#0F172A",
  },

  featureCard: {
    flexDirection: "row",
    marginBottom: 14,
  },

  featureTextWrap: {
    marginLeft: 12,
    flex: 1,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  featureDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0F172A",
  },

  infoText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: "#0EA5E9",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#0EA5E9",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryText: {
    color: "#0EA5E9",
    fontSize: 16,
    fontWeight: "600",
  },
});
