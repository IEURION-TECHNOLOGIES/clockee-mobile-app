import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function VisitorInfoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.center}>
        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark" size={44} color="#0EA5E9" />
        </View>

        <Text style={styles.title}>Request Sent Successfully</Text>

        <Text style={styles.subtitle}>
          Thank you for your interest in{" "}
          <Text style={styles.brand}>Clockee</Text>.
        </Text>

        <Text style={styles.message}>
          We’ve received your request and our team will contact you shortly
          with the next steps.
        </Text>
      </View>

      <View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You’ll be contacted via email or phone
          </Text>
        </View>

        {/* OK BUTTON */}
        <Pressable
          style={styles.okButton}
          onPress={() => router.replace("/dashboard/visitorDashboard/visitorDashboard")}
        >
          <Text style={styles.okButtonText}>Okay</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  iconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#0EA5E9",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginBottom: 12,
  },

  brand: {
    fontWeight: "600",
    color: "#0EA5E9",
  },

  message: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 320,
  },

  infoBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  infoText: {
    fontSize: 14,
    color: "#334155",
    textAlign: "center",
  },

  okButton: {
    height: 50,
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  okButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
