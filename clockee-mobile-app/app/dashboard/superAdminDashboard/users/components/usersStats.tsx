import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UsersStats() {
  const stats = {
    totalUsers: 4280,
    staff: 3900,
    admins: 300,
    primaryAdmins: 80,
  };

  return (
    <View style={styles.container}>
      <StatCard title="Total Users" value={stats.totalUsers} />
      <StatCard title="Staff" value={stats.staff} />
      <StatCard title="Admins" value={stats.admins} />
      <StatCard title="Primary Admins" value={stats.primaryAdmins} />
    </View>
  );
}

function StatCard({ title, value }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    width: "48%",
  },

  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0284C7",
  },

  title: {
    fontSize: 12,
    color: "#64748B",
  },
});