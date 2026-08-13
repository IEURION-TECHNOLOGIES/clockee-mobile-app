import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ManualRequestScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Manual Request</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* EMPLOYEE INFO */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-outline" size={18} color="#0284C7" />
          <Text style={styles.cardTitle}>Employee Information</Text>
        </View>

        <View style={styles.grid}>
          <Info label="Employee Name" value="Jenny Doe Abel" />
          <Info label="Employee ID" value="ID07666" />
          <Info label="Job Title" value="Teacher" />
          <Info label="Status" value="Full Time" />
        </View>
      </View>

      {/* DATE & TIME */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={18} color="#0284C7" />
          <Text style={styles.cardTitle}>Date and Time</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.pill}>
            <Ionicons name="calendar" size={14} color="#64748B" />
            <Text style={styles.pillText}>Thu, 19 Sept 2025</Text>
          </View>

          <View style={styles.pill}>
            <Ionicons name="time" size={14} color="#64748B" />
            <Text style={styles.pillText}>08:30 am</Text>
          </View>
        </View>
      </View>

      {/* REASON */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text-outline" size={18} color="#0284C7" />
          <Text style={styles.cardTitle}>Reason</Text>
        </View>

        <TextInput
          placeholder="add text"
          placeholderTextColor="#94A3B8"
          multiline
          style={styles.textArea}
        />
      </View>

      {/* SUBMIT */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("/dashboard/staffDashboard/clockIn/manual/confirm")}
      >
        <Text style={styles.buttonText}>Submit Request</Text>
      </Pressable>
    </View>
  );
}

/* SMALL COMPONENT */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7FB",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  cardTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: "#0F172A",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  infoBox: {
    width: "48%",
  },

  label: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },

  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
  },

  pillText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
  },

  textArea: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    height: 110,
    padding: 14,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#0F172A",
  },

  button: {
    marginTop: "auto",
    marginBottom: 30,
    height: 56,
    backgroundColor: "#0284C7",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
