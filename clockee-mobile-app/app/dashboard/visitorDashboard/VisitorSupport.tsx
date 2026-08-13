import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function Support() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <Text style={styles.title}>Support & Help</Text>
      <Text style={styles.subtitle}>
        Need help with Clockee? Our team is always ready to assist you.
      </Text>

      {/* SUPPORT METHODS */}
      <View style={styles.card}>
        <View style={styles.item}>
          <Ionicons name="mail-outline" size={22} color="#0EA5E9" />
          <View style={styles.textWrap}>
            <Text style={styles.itemTitle}>Email Support</Text>
            <Text style={styles.text}>support@clockee.com</Text>
            <Text style={styles.helperText}>
              Best for detailed questions or requests
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Ionicons name="call-outline" size={22} color="#0EA5E9" />
          <View style={styles.textWrap}>
            <Text style={styles.itemTitle}>Phone Support</Text>
            <Text style={styles.text}>
              +234 708 382 4850
            </Text>
            <Text style={styles.text}>
              +234 810 655 1348
            </Text>
            <Text style={styles.text}>
              +234 916 892 4734
            </Text>
            <Text style={styles.helperText}>
              Available during business hours
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Ionicons name="globe-outline" size={22} color="#0EA5E9" />
          <View style={styles.textWrap}>
            <Text style={styles.itemTitle}>Website</Text>
            <Text style={styles.text}>www.clockee.com</Text>
            <Text style={styles.helperText}>
              Learn more about features and updates
            </Text>
          </View>
        </View>
      </View>

      {/* WHAT WE HELP WITH */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What we can help you with</Text>

        <Text style={styles.bullet}>• Demo requests & onboarding</Text>
        <Text style={styles.bullet}>• Institution setup questions</Text>
        <Text style={styles.bullet}>• Account & access issues</Text>
        <Text style={styles.bullet}>• Feature explanations</Text>
        <Text style={styles.bullet}>• General inquiries</Text>
      </View>

      {/* FOOTER NOTE */}
      <Text style={styles.footerText}>
        Clockee Support Team typically responds within 24 hours.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
    marginTop: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  textWrap: {
    marginLeft: 12,
    flex: 1,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },

  text: {
    fontSize: 14,
    color: "#334155",
  },

  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },

  infoBox: {
    marginTop: 24,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 10,
  },

  bullet: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 6,
  },

  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
});
