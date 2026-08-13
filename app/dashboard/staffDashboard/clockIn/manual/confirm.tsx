import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ManualConfirmScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#0284C7" />
      </Pressable>

      {/* PROFILE CARD */}
      <View style={styles.profileWrap}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/150?img=47",
          }}
          style={styles.avatar}
        />

        <View style={styles.profileCard}>
          <Text style={styles.name}>Jenny Doe</Text>
          <Text style={styles.role}>Teacher</Text>

          <View style={styles.schoolRow}>
            <Ionicons name="business-outline" size={14} color="#E0F2FE" />
            <Text style={styles.school}>Rubyrose Primary School</Text>
          </View>
        </View>
      </View>

      {/* DETAILS CARD */}
      <View style={styles.detailsCard}>
        <Detail label="Employee ID" value="ID07666" />
        <Detail label="Method" value="QR code" />
        <Detail label="Location" value="School Premises" />
        <Detail label="Status" value="Full time" />
        <Detail label="Time" value="08:30 am" />
        <Detail label="GPS Accuracy" value="±5 meters" />
      </View>

      {/* SUBMIT */}
      <Pressable
        style={styles.button}
        onPress={() => router.replace("/dashboard/staffDashboard/clock/location")}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
}

/* SMALL COMPONENT */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7FB",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },

  profileWrap: {
    alignItems: "center",
    marginTop: 20,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: "#F3F7FB",
    position: "absolute",
    top: -42,
    zIndex: 10,
  },

  profileCard: {
    width: "100%",
    backgroundColor: "#0284C7",
    borderRadius: 22,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  role: {
    color: "#E0F2FE",
    marginTop: 4,
    fontSize: 14,
  },

  schoolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  school: {
    color: "#E0F2FE",
    fontSize: 13,
  },

  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginTop: 24,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  detailLabel: {
    color: "#94A3B8",
    fontSize: 13,
  },

  detailValue: {
    fontWeight: "500",
    color: "#0F172A",
    fontSize: 14,
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
