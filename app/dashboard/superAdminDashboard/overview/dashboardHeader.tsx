import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, hexToRgba } from "@/theme/theme";
import { CurrentUser } from "@/types/dashboard";
import { useProfile } from "@/hooks/useProfile";

function LiveDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(withTiming(2.2, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.liveDotWrap}>
      <Animated.View style={[styles.liveDotRing, ringStyle]} />
      <View style={styles.liveDotCore} />
    </View>
  );
}

export default function DashboardHeader({ user }: { user: CurrentUser }) {

   const { data: profile, isLoading, error } = useProfile();
  return (
    <View style={styles.container}>
      {/* Left: brand mark */}
      <View style={styles.brandRow}>
        <Pressable style={styles.iconButton}>
          <Feather name="user" size={20} color={colors.muted} />
        </Pressable>
        <View>
          <Text style={styles.brandTitle}>{profile?.name}</Text>
          <Text style={styles.brandSubtitle}>{profile?.role}</Text>
        </View>
      </View>

      {/* Right: notifications + user */}
      <View style={styles.rightRow}>
        <Pressable style={styles.iconButton}>
          <Feather name="bell" size={16} color={colors.muted} />
          <LiveDot />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandTitle: { color: colors.text, fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  brandSubtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  rightRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  liveDotWrap: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  liveDotRing: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: hexToRgba(colors.red, 0.5),
  },
  liveDotCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  userBlock: { flexDirection: "row", alignItems: "center", gap: 8, maxWidth: 160 },
  userName: { color: colors.text, fontSize: 13, fontWeight: "700" },
  userRole: { color: colors.muted, fontSize: 11, marginTop: 1 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: hexToRgba(colors.teal, 0.12),
    borderWidth: 2,
    borderColor: hexToRgba(colors.teal, 0.4),
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.teal, fontSize: 13, fontWeight: "700" },
});