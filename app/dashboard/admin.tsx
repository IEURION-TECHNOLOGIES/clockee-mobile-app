import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>Today: 0h 00m</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/clock")}
      >
        <Text style={styles.buttonText}>Clock In / Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardText: {
    color: "#22C55E",
    fontSize: 18,
  },
  button: {
    backgroundColor: "#22C55E",
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "700",
  },
});
