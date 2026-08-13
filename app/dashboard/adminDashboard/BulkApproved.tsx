import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const members = [
  {
    id: "1",
    name: "Sarah Jakes",
    email: "sarahjakes@admins.ng",
    role: "Admin",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Jakes",
    email: "sarahjakes@admins.ng",
    role: "Admin",
    status: "pending",
  },
  {
    id: "3",
    name: "Sarah Jakes",
    email: "sarahjakes@admins.ng",
    role: "Staff",
    status: "expired",
  },
  {
    id: "4",
    name: "Sarah Jakes",
    email: "sarahjakes@admins.ng",
    role: "Admin",
    status: "active",
  },
  {
    id: "5",
    name: "Sarah Jakes",
    email: "sarahjakes@admins.ng",
    role: "Staff",
    status: "pending",
  },
];

export default function BulkInviteDetails() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bulk Invite</Text>
        <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/dashboard/superAdminDashboard/new")}
        >
            <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {members.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* TOP */}
            <View style={styles.row}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150" }}
                style={styles.avatar}
              />

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <StatusBadge status={item.status} />
                </View>

                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.role}>• {item.role}</Text>
              </View>
            </View>

            {/* TIME */}
            <Text style={styles.time}>• 2 hours ago</Text>

            {/* ACTIONS */}
            <View style={styles.actions}>
              {item.status === "active" && (
                <>
                  <PrimaryBtn text="Approve" />
                  <OutlineBtn text="Deny" />
                </>
              )}

              {item.status === "pending" && (
                <>
                  <PrimaryBtn text="Resend" />
                  <OutlineBtn text="Revoke" />
                </>
              )}

              {item.status === "expired" && (
                <>
                  <PrimaryBtn text="Resend" />
                  <OutlineBtn text="Cancel" />
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    active: { bg: "#DCFCE7", text: "#16A34A", label: "Active" },
    pending: { bg: "#FEF3C7", text: "#D97706", label: "Pending" },
    expired: { bg: "#FEE2E2", text: "#DC2626", label: "Expired" },
  };

  return (
    <View style={[styles.badge, { backgroundColor: map[status].bg }]}>
      <Text style={{ color: map[status].text, fontSize: 12 }}>
        {map[status].label}
      </Text>
    </View>
  );
}

function PrimaryBtn({ text }: { text: string }) {
  return (
    <TouchableOpacity style={styles.primaryBtn}>
      <Text style={styles.primaryText}>{text}</Text>
    </TouchableOpacity>
  );
}

function OutlineBtn({ text }: { text: string }) {
  return (
    <TouchableOpacity style={styles.outlineBtn}>
      <Text style={styles.outlineText}>{text}</Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: { fontSize: 18, fontWeight: "600", textAlign: "center", flex: 1 },

  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
  },

  row: { flexDirection: "row", gap: 12 },

  avatar: { width: 44, height: 44, borderRadius: 22 },

  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: { fontSize: 14, fontWeight: "600" },
  email: { fontSize: 12, color: "#64748B" },
  role: { fontSize: 12, color: "#0284C7", marginTop: 2 },

  time: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
    marginLeft: 56,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  primaryText: { color: "#fff", fontWeight: "600" },

  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  outlineText: { fontWeight: "600" },
});
