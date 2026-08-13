import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AuditLogs() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Coming Soon</Text>
    </ScrollView>
  );
}

function Log({ text }: { text: string }) {
  return (
    <View style={styles.log}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F8FAFC", marginTop: 40  },
  header: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  log: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  text: { fontSize: 13, color: "#334155" },
});