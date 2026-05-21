import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import BottomNav from "../../../../components/BottomNav";
import { useAuth } from "../../../../context/AuthContext";
import logo from "../../../../assets/images/splash/clockee_logo.png";
import { useProfile } from "@/hooks/useProfile";

export default function StaffProfile() {
  const router = useRouter();
  const { logout } = useAuth();

  const {
    data: profile,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useProfile();

  // 🔥 Do NOT block screen
  const safeProfile = profile || {};

  const role =
    safeProfile?.role?.[0]?.replace("_", " ") || "User";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.headerCard}>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#0EA5E9"
              style={{ marginBottom: 10 }}
            />
          )}

          <Image
            source={
              safeProfile?.avatar &&
              safeProfile.avatar.startsWith("http")
                ? { uri: safeProfile.avatar }
                : logo
            }
            style={styles.avatar}
          />

          <Text style={styles.name}>
            {safeProfile?.name || "Loading..."}
          </Text>

          <Text style={styles.email}>
            {safeProfile?.email || ""}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color="#0284C7"
            />
            <Text style={styles.roleText}>
              {role}
            </Text>
          </View>
        </View>

        {/* ERROR (Non Blocking) */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Failed to load profile. Pull to refresh.
            </Text>
          </View>
        )}

        {/* INFORMATION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Information
          </Text>

          {renderRow(
            "phone-portrait-outline",
            "Phone Number",
            safeProfile?.phone
          )}

          {renderRow(
            "shield-checkmark",
            "Staff ID",
            safeProfile?.studentOrStaffId
          )}

          {renderRow(
            "business-outline",
            "Department",
            safeProfile?.departmentOrUnit
          )}

          {renderRow(
            "school-outline",
            "Institution",
            safeProfile?.institutionName
          )}

          {renderRow(
            "location-outline",
            "Address",
            safeProfile?.address
          )}
        </View>

        {/* ACCOUNT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Account Settings
          </Text>

          {renderRow(
            "time-outline",
            "Clock Mode",
            safeProfile?.clockMode
          )}

          {renderRow(
            "globe-outline",
            "Remote Access",
            safeProfile?.remoteAccess?.allowed
              ? "Allowed"
              : "Not Allowed"
          )}

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() =>
              router.push(
                "/dashboard/staffDashboard/profile/edit"
              )
            }
          >
            <View style={styles.actionLeft}>
              <Ionicons
                name="create-outline"
                size={18}
                color="#0EA5E9"
              />
              <Text style={styles.actionText}>
                Edit Profile
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#CBD5E1"
            />
            
          </TouchableOpacity>

          {/* Optional Logout */}
          
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color="#fff"
            />
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity> 
      
        </View>
      </ScrollView>

      <BottomNav dashboardType="staff" />
    </View>
  );
}

/* ✅ Reusable Row */
const renderRow = (
  icon: keyof typeof Ionicons.glyphMap,
  label: string,
  value: any
) => {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "Not provided"
      : value;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
          size={18}
          color="#555"
        />
        <Text style={styles.rowLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.rowValue}>
        {displayValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
    elevation: 3,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
  },

  email: {
    color: "#64748B",
    marginBottom: 10,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  roleText: {
    color: "#0284C7",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "capitalize",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  rowLabel: {
    color: "#64748B",
    fontSize: 14,
  },

  rowValue: {
    fontWeight: "600",
    fontSize: 14,
    color: "#0F172A",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    marginTop: 10,
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  actionText: {
    fontWeight: "500",
    fontSize: 14,
  },

  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  errorText: {
    color: "#991B1B",
    fontSize: 13,
  },
});


