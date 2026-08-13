// components/StatusCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type StatusType = "loading" | "success" | "error";

interface StatusCardProps {
  type: StatusType;
  title: string;
  subtitle?: string;
  meta?: string;
  buttonText?: string;
  onPress?: () => void;
}

export default function StatusCard({
  type,
  title,
  subtitle,
  meta,
  buttonText,
  onPress,
}: StatusCardProps) {
  const renderIcon = () => {
    if (type === "loading") {
      return <ActivityIndicator size="large" color="#0EA5E9" />;
    }

    if (type === "success") {
      return (
        <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
      );
    }

    return (
      <Ionicons name="close-circle" size={64} color="#DC2626" />
    );
  };

  const buttonColor =
    type === "success" ? "#16A34A" : "#0EA5E9";

  return (
    <View style={styles.card}>
      {renderIcon()}

      <Text style={styles.title}>{title}</Text>

      {subtitle && <Text style={styles.sub}>{subtitle}</Text>}

      {meta && <Text style={styles.meta}>{meta}</Text>}

      {buttonText && onPress && (
        <Pressable
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
 card: {
  flex: 1,                 // 🔥 THIS IS THE KEY
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 24,
  alignItems: "center",
  justifyContent: "center", // center content vertically
},

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },

  sub: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
  },

  meta: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 8,
  },

  button: {
    marginTop: 20,
    height: 52,
    paddingHorizontal: 40,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
