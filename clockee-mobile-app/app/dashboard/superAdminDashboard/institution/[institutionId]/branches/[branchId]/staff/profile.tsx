import React, {
  useState,
  useCallback,
} from "react";

import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import UserActionModal from "@/components/UserActionModal";

import {
  allowRemoteClocking,
  promoteToAdmin,
  demoteToStaff,
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  logoutUser,
} from "@/services/superAdminServices";


export default function StaffProfile() {
  const router = useRouter();

  const { staff, institutionId } =
    useLocalSearchParams<{
      staff: string;
      institutionId: string;
    }>();

  const [parsedStaff, setParsedStaff] = useState<any>(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  /* ================= ALWAYS RE-PARSE ON FOCUS ================= */

  useFocusEffect(
    useCallback(() => {
      console.log("🔄 StaffProfile focused");

      if (staff) {
        try {
          const parsed = JSON.parse(staff);
          setParsedStaff(parsed);
        } catch (e) {
          console.log("❌ Failed to parse staff:", e);
        }
      }
    }, [staff])
  );

  if (!parsedStaff) {
    return (
      <View style={styles.center}>
        <Text>No staff data found</Text>
      </View>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    parsedStaff.name || "User"
  )}&background=0284C7&color=fff`;

  const accountStatus = parsedStaff.isActive
    ? "ACTIVE"
    : "INACTIVE";

  const roleLabel =
    parsedStaff.role?.includes("admin")
      ? "ADMIN"
      : "STAFF";

  const remoteAccess =
    parsedStaff.remoteAccess?.allowed ?? false;

  /* ================= ACTION HANDLER ================= */

  const runAction = async (
    type: string,
    fn: Function,
    extraParams?: any[]
  ) => {
    try {
      setLoadingAction(true);

      let response;

      if (extraParams) {
        response = await fn(parsedStaff._id, ...extraParams);
      } else {
        response = await fn(parsedStaff._id);
      }

      console.log("✅ API RESPONSE:", response?.data);

      /* ===== SAFE LOCAL STATE UPDATE ===== */

      setParsedStaff((prev: any) => {
        if (!prev) return prev;

        switch (type) {
          case "remote":
            return {
              ...prev,
              remoteAccess: {
                ...(prev.remoteAccess || {}),
                allowed: !prev?.remoteAccess?.allowed,
              },
            };

          case "deactivate":
            return { ...prev, isActive: false };

          case "reactivate":
            return { ...prev, isActive: true };

          case "promote":
            return { ...prev, role: "admin" };

          case "demote":
            return { ...prev, role: "staff" };

          default:
            return prev;
        }
      });

      setActionVisible(false);
    } catch (err) {
      console.log("❌ Action error:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ===== HERO ===== */}
      <LinearGradient
        colors={["#0284C7", "#0F172A"]}
        style={styles.hero}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActionVisible(true)}>
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: avatarUrl }} style={styles.avatar} />

        <Text style={styles.name}>{parsedStaff.name}</Text>
        <Text style={styles.role}>{roleLabel}</Text>

        {/* STATUS BADGE */}
        <View style={styles.statusBadge}>
          <Ionicons
            name={
              parsedStaff.isActive
                ? "checkmark-circle"
                : "close-circle"
            }
            size={14}
            color={parsedStaff.isActive ? "#22C55E" : "#EF4444"}
          />
          <Text style={styles.statusText}>{accountStatus}</Text>
        </View>

        {/* REMOTE BADGE */}
        <View style={styles.remoteBadge}>
          <Ionicons
            name={remoteAccess ? "wifi" : "wifi-outline"}
            size={14}
            color={remoteAccess ? "#22C55E" : "#EF4444"}
          />
          <Text style={styles.remoteText}>
            {remoteAccess
              ? "REMOTE CLOCKING ENABLED"
              : "REMOTE CLOCKING DISABLED"}
          </Text>
        </View>
      </LinearGradient>

      {/* ===== DETAILS ===== */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={parsedStaff.email}
          />

          <InfoRow
            icon="business-outline"
            label="Department"
            value={parsedStaff.departmentOrUnit}
          />

          <InfoRow
            icon="card-outline"
            label="Staff ID"
            value={parsedStaff.studentOrStaffId}
          />

          <InfoRow
            icon="calendar-outline"
            label="Created"
            value={
              parsedStaff.createdAt
                ? new Date(parsedStaff.createdAt).toDateString()
                : "N/A"
            }
          />
        </View>
      </ScrollView>

      {/* ACTION MODAL */}
      <UserActionModal
        visible={actionVisible}
        role={roleLabel === "ADMIN" ? "admin" : "staff"}
        status={parsedStaff.isActive ? "active" : "inactive"}
        remoteAccess={remoteAccess}
        onClose={() => setActionVisible(false)}
        onPromote={() => runAction("promote", promoteToAdmin)}
        onDemote={() => runAction("demote", demoteToStaff)}
        onDeactivate={() => runAction("deactivate", deactivateUser)}
        onReactivate={() => runAction("reactivate", reactivateUser)}
        onResetPassword={() => runAction("reset", resetUserPassword)}
        onLogout={() => runAction("logout", logoutUser)}
        onToggleRemote={() =>
          runAction("remote", allowRemoteClocking, [
            institutionId,
            !remoteAccess,
          ])
        }
      />
    </View>
  );
}

/* ================= INFO ROW ================= */
function InfoRow({ icon, label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#0284C7" />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>
          {value || "N/A"}
        </Text>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: { fontSize: 18, fontWeight: "800", color: "#fff" },
  role: {
    fontSize: 13,
    marginTop: 4,
    color: "#E0F2FE",
    fontWeight: "600",
  },
  remoteBadge: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  remoteText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  statusBadge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 20,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoLabel: { fontSize: 11, color: "#64748B" },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
});
