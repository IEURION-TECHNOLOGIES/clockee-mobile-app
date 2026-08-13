// ======================= Notifications.js =======================
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Notifications() {
  const router = useRouter();

  // 🔔 SAMPLE DATA
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "You clocked in",
      message: "Your shift started at 09:03 AM",
      time: "10 mins ago",
      read: false,
      type: "success",
      section: "Today",
    },
    {
      id: "2",
      title: "Late Arrival",
      message: "You were late yesterday",
      time: "1 day ago",
      read: false,
      type: "warning",
      section: "Today",
    },
    {
      id: "3",
      title: "Leave Approved",
      message: "Your leave request was approved",
      time: "2 days ago",
      read: true,
      type: "success",
      section: "Earlier",
    },
  ]);

  // 🧠 MARK AS READ
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  // 🎨 ICON BASED ON TYPE
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#22C55E" };
      case "warning":
        return { name: "alert-circle", color: "#F59E0B" };
      case "error":
        return { name: "close-circle", color: "#EF4444" };
      default:
        return { name: "notifications", color: "#6366F1" };
    }
  };

  // 📦 RENDER ITEM
  const renderItem = ({ item }) => {
    const icon = getIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.item,
          !item.read && styles.unreadItem,
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <Ionicons name={icon.name} size={24} color={icon.color} />

        <View style={styles.textWrap}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        {!item.read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  // 🧠 GROUPING
  const today = notifications.filter(n => n.section === "Today");
  const earlier = notifications.filter(n => n.section === "Earlier");

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* ================= LIST ================= */}
      <FlatList
        ListHeaderComponent={
          <>
            {today.length > 0 && (
              <Text style={styles.section}>Today</Text>
            )}
          </>
        }
        data={today}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={
          <>
            {earlier.length > 0 && (
              <>
                <Text style={styles.section}>Earlier</Text>
                {earlier.map((item) => (
                  <View key={item.id}>
                    {renderItem({ item })}
                  </View>
                ))}
              </>
            )}
          </>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* ================= EMPTY STATE ================= */}
      {notifications.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="notifications-off" size={50} color="#94A3B8" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      )}

    </SafeAreaView>
  );
}

// ======================= STYLES =======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "700",
    color: "#64748B",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },

  textWrap: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontWeight: "700",
    fontSize: 14,
  },

  message: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },

  time: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },

  empty: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    color: "#64748B",
  },
});

