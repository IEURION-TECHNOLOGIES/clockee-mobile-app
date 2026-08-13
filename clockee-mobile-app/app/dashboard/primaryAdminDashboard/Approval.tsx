import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNav from "../../../components/BottomNav";
import ResponseModal from "../../../components/ResponseModal";

/**
 * ⚠️ API INTEGRATION PENDING
 * Static mock data only
 */

type ApprovalItem = {
  id: string;
  type: "invite" | "department";
  name?: string;
  role?: string;
  email: string;
  initials?: string;
  color?: string;
  title?: string;
  subtitle?: string;
};

export default function ApprovalsScreen() {
  const router = useRouter();

  // const [activeTab, setActiveTab] = useState<"invites" | "pending">("invites");

  /** MODAL STATE */
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /** MOCK DATA */
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: "1",
      type: "invite",
      name: "Sarah Jakes",
      role: "Admin",
      email: "sarah.jakes@admins.ng",
    },
    {
      id: "2",
      type: "department",
      initials: "EB",
      color: "#FBBF24",
      title: "HR Department",
      subtitle: "East Branch created",
      email: "sarah.jakes@admins.ng",
    },
    {
      id: "3",
      type: "invite",
      name: "John Smith",
      role: "Manager",
      email: "john.smith@admins.ng",
    },
    {
      id: "4",
      type: "department",
      initials: "RH",
      color: "#8B5CF6",
      title: "Procurement Department",
      subtitle: "Regional HQ created",
      email: "admin@company.ng",
    },
  ]);

  /** APPROVE */
  const handleApprove = (item: ApprovalItem) => {
    setApprovals(prev => prev.filter(i => i.id !== item.id));

    setModalType("success");
    setModalTitle("Approved Successfully");
    setModalMessage(
      item.type === "invite"
        ? `${item.name} has been granted access.`
        : `${item.title} has been approved.`
    );

    setModalVisible(true);
  };

  /** DENY */
  const handleDeny = (item: ApprovalItem) => {
    setApprovals(prev => prev.filter(i => i.id !== item.id));

    setModalType("error");
    setModalTitle("Request Denied");
    setModalMessage(
      item.type === "invite"
        ? `Invite for ${item.name} has been denied.`
        : `${item.title} request has been rejected.`
    );

    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Approvals</Text>
        <TouchableOpacity onPress={() => router.push("./Notification")}>
          <Ionicons name="notifications-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#64748B" />
          <TextInput
            placeholder="Search approvals"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* TABS */}
      {/* <View style={styles.tabs}>
        {["invites", "pending"].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "invites" ? "Invites" : "Pending"}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* LIST */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {approvals.map(item =>
          item.type === "invite" ? (
            <InviteItem
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item)}
              onDeny={() => handleDeny(item)}
            />
          ) : (
            <DepartmentItem
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item)}
              onDeny={() => handleDeny(item)}
            />
          )
        )}

        {approvals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyText}>No pending approvals</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav {...({ active: "approvals" } as any)} />

      {/* RESPONSE MODAL */}
      <ResponseModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

/* ================= INVITE ITEM ================= */
function InviteItem({
  item,
  onApprove,
  onDeny,
}: {
  item: ApprovalItem;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <Text style={styles.name}>
            {item.name}{" "}
            <Text style={styles.accepted}>accepted your invite</Text>
          </Text>
          <Text style={styles.role}>• {item.role}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>

        <Text style={styles.time}>2h</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.denyBtn} onPress={onDeny}>
          <Text style={styles.denyText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= DEPARTMENT ITEM ================= */
function DepartmentItem({
  item,
  onApprove,
  onDeny,
}: {
  item: ApprovalItem;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.initialBox, { backgroundColor: item.color }]}>
          <Text style={styles.initialText}>{item.initials}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.deptSubtitle}>{item.subtitle}</Text>
          <Text style={styles.deptTitle}>{item.title}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>

        <Text style={styles.time}>2h</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.denyBtn} onPress={onDeny}>
          <Text style={styles.denyText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 16, marginTop: 50 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  searchRow: { marginBottom: 14 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },

  tabs: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#0EA5E9" },
  tabText: { color: "#64748B", fontWeight: "500" },
  activeTabText: { color: "#FFF" },

  card: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  row: { flexDirection: "row", alignItems: "flex-start" },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },

  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" },
  accepted: { color: "#64748B", fontWeight: "400" },
  role: { fontSize: 13, color: "#64748B" },
  email: { fontSize: 13, color: "#2563EB", marginTop: 4 },
  time: { fontSize: 12, color: "#94A3B8" },

  actions: { flexDirection: "row", gap: 12, marginTop: 14 },
  approveBtn: { flex: 1, backgroundColor: "#0EA5E9", paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  approveText: { color: "#FFF", fontWeight: "600" },
  denyBtn: { flex: 1, borderWidth: 1, borderColor: "#111", paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  denyText: { fontWeight: "600" },

  initialBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  initialText: { color: "#FFF", fontWeight: "700" },
  deptTitle: { fontSize: 14, fontWeight: "600" },
  deptSubtitle: { fontSize: 12, color: "#64748B" },

  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { marginTop: 8, color: "#94A3B8" },
});
