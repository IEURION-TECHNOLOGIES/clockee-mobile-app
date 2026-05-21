import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserCard({ user, openActions }: any) {
  return (
    <View style={styles.card}>

      <View>
        <Text style={styles.name}>{user.name}</Text>

        <Text style={styles.meta}>
          {user.role} • {user.institution}
        </Text>

        <Text style={styles.branch}>
          Branch: {user.branch}
        </Text>

        <Text style={styles.status}>
          Status: {user.status}
        </Text>
      </View>

      <TouchableOpacity onPress={() => openActions(user)}>
        <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  meta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  branch: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },

  status: {
    fontSize: 11,
    color: "#16A34A",
    marginTop: 2,
  },

});