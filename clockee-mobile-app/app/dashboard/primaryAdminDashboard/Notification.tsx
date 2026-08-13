import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationScreen() {
  const [activeTab, setActiveTab] = useState<"activities" | "compliance">(
    "activities"
  );

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()} hitSlop={10}
        >
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "activities" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("activities")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "activities" && styles.activeTabText,
            ]}
          >
            Activities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "compliance" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("compliance")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "compliance" && styles.activeTabText,
            ]}
          >
            Compliance
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === "activities" ? (
          <>
            {/* TODAY */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today</Text>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>2 Unread</Text>
              </View>
            </View>

            <NotificationItem
              title="New Branch Admin Created"
              subtitle="Lisa Wang assigned to Tech Innovation Hub"
            />

            <NotificationItem
              title="Attendance Policy Updated"
              subtitle="Grace period changed from 15 to 10 minutes"
            />

            <NotificationItem
              title="Manual Override Approved"
              subtitle="Bulk attendance correction for Main Campus"
            />

            <NotificationItem
              title="Password Reset"
              subtitle="Branch admin credentials reset for North Valley"
            />

            {/* YESTERDAY */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yesterday</Text>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>1 Unread</Text>
              </View>
            </View>

            <NotificationItem
              title="Admin Role Changed"
              subtitle="Michael Chen promoted to Senior Branch Admin"
            />

            <NotificationItem
              title="Pending Approval for new Department"
              subtitle="Approval required for new department created by East Branch Admin"
            />

            <NotificationItem
              title="New Branch Admin Created"
              subtitle="Lisa Wang assigned to Tech Innovation Hub"
            />
          </>
        ) : (
          <>
            {/* COMPLIANCE */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alerts</Text>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>5 New</Text>
              </View>
            </View>

            <ComplianceItem
              status="warning"
              title="Late Submission"
              subtitle="Attendance submitted 2 hours after deadline"
              branch="Ajegunle"
            />

            <ComplianceItem
              status="success"
              title="Missing Attendance Log"
              subtitle="No attendance recorded for today"
              branch="Ogudu"
            />

            <ComplianceItem
              status="success"
              title="Anomaly Detected"
              subtitle="100% attendance reported for 30 consecutive days"
              branch="Yaba"
            />

            <ComplianceItem
              status="success"
              title="Failed attendance"
              subtitle="Ikeja branch has not submitted attendance log for 2 days"
              branch="Ikeja"
            />

            <ComplianceItem
              status="error"
              title="Late Submission"
              subtitle="Morning attendance submitted at 2:45 PM"
              branch="Ikeja"
            />

            <ComplianceItem
              status="error"
              title="Sync Failure"
              subtitle="Branch data sync failed - connection timeout"
              branch="Maryland"
            />

            <ComplianceItem
              status="error"
              title="Sync Failure"
              subtitle="Branch data sync failed - connection timeout"
              branch="Ajegunle"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* 🔔 ACTIVITIES ITEM */
function NotificationItem({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.dot} />
      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.time}>2 hours ago</Text>
        </View>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

/* ⚠️ COMPLIANCE ITEM */
function ComplianceItem({
  status,
  title,
  subtitle,
  branch,
}: {
  status: "success" | "warning" | "error";
  title: string;
  subtitle: string;
  branch: string;
}) {
  const dotColor =
    status === "success"
      ? "#22C55E"
      : status === "warning"
      ? "#F97316"
      : "#EF4444";

  return (
    <View style={styles.item}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.time}>2 hours ago</Text>
        </View>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
        <Text style={styles.branch}>{branch}</Text>
      </View>
    </View>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    marginTop: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#0EA5E9",
  },

  tabText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  activeTabText: {
    color: "#FFF",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },

  unreadBadge: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },

  unreadText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },

  item: {
    flexDirection: "row",
    paddingVertical: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
    backgroundColor: "#22C55E",
  },

  itemContent: {
    flex: 1,
  },

  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    paddingRight: 8,
  },

  time: {
    fontSize: 12,
    color: "#94A3B8",
  },

  itemSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  branch: {
    fontSize: 13,
    color: "#2563EB",
    marginTop: 6,
    fontWeight: "500",
  },
});
