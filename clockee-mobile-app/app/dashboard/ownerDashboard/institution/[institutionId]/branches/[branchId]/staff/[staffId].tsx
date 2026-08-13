import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import UserActionModal from "@/components/UserActionModal";

import {
  allowRemoteClocking,
  promoteToAdmin,
  deactivateUser,
  reactivateUser,
  getSingleUser,
} from "@/services/superAdminServices";

export default function StaffProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { institutionId, staffId: paramStaffId } = useLocalSearchParams<{
    institutionId?: string;
    staffId?: string;
  }>();

  const [actionVisible, setActionVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // ================= FETCH SINGLE USER =================
  const {
  data: staff,
  isLoading,
  isFetching,
  isError,
} = useQuery({
  queryKey: ["staffProfile", paramStaffId],
  queryFn: async () => {
    if (!paramStaffId) throw new Error("Staff ID is required");
    const res = await getSingleUser(paramStaffId);
    return res?.data?.data || res?.data;
  },
  enabled: !!paramStaffId,
  staleTime: 1000 * 60 * 5, // ✅ 5 minutes cache
  cacheTime: 1000 * 60 * 10, // ✅ keep in memory 10 minutes
  refetchOnMount: false,     // ✅ do NOT refetch every time screen opens
  refetchOnWindowFocus: false,
});

  // ================= ACTION HANDLER =================
  const runAction = async (fn: Function, extraParams?: any[]) => {
    try {
      setLoadingAction(true);

      const currentStaffId = paramStaffId || staff?._id;
      if (!currentStaffId) throw new Error("User ID not found");

      if (extraParams) {
        await fn(currentStaffId, ...extraParams);
      } else {
        await fn(currentStaffId);
      }

      // 🔥 Always refetch fresh user data
      await queryClient.invalidateQueries({
        queryKey: ["staffProfile", paramStaffId],
      });

    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoadingAction(false);
      setActionVisible(false);
    }
  };

  // ================= STATES =================
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={{ marginTop: 12, color: "#64748B" }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (isError || !staff) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text
          style={{ marginTop: 16, fontSize: 18, fontWeight: "600" }}
        >
          User Not Found
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#0284C7" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ================= DERIVED VALUES =================
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    staff.name || "User"
  )}&background=0284C7&color=fff`;

  const roleLabel: "admin" | "staff" = Array.isArray(staff.role)
    ? staff.role.some((r: string) =>
        r?.toLowerCase().includes("admin")
      )
      ? "admin"
      : "staff"
    : typeof staff.role === "string" &&
      staff.role.toLowerCase().includes("admin")
    ? "admin"
    : "staff";

  const isActive = staff.isActive ?? true;
  const remoteAccess = staff.remoteAccess?.allowed ?? false;

  // ================= UI =================
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0284C7", "#0F172A"]}
        style={styles.hero}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActionVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Text style={styles.name}>{staff.name}</Text>
        <Text style={styles.role}>{roleLabel.toUpperCase()}</Text>

        <View style={styles.statusBadge}>
          <Ionicons
            name={isActive ? "checkmark-circle" : "close-circle"}
            size={14}
            color={isActive ? "#22C55E" : "#EF4444"}
          />
          <Text style={styles.statusText}>
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>

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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={staff.email}
          />
          <InfoRow
            icon="business-outline"
            label="Department"
            value={staff.departmentOrUnit}
          />
          <InfoRow
            icon="card-outline"
            label="Staff ID"
            value={staff.studentOrStaffId}
          />
          <InfoRow
            icon="calendar-outline"
            label="Created"
            value={
              staff.createdAt
                ? new Date(staff.createdAt).toDateString()
                : "N/A"
            }
          />
        </View>
      </ScrollView>

      <UserActionModal
        visible={actionVisible}
        role={roleLabel}
        status={isActive ? "active" : "inactive"}
        remoteAccess={remoteAccess}
        loading={loadingAction}
        onClose={() => setActionVisible(false)}
        onPromote={() => runAction(promoteToAdmin)}
        onDeactivate={() => runAction(deactivateUser)}
        onReactivate={() => runAction(reactivateUser)}
        onToggleRemote={() =>
          runAction(allowRemoteClocking, [institutionId!, !remoteAccess])
        }
      />
    </View>
  );
}

/* ================= HELPER ================= */
function InfoRow({ icon, label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#0284C7" />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "N/A"}</Text>
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

  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
  },
});

