import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import logo from "../../../../assets/images/splash/clockee_logo.png";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BottomNav from "../../../../components/BottomNav";
import { useAuth } from "../../../../context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

/* ================= MAIN COMPONENT ================= */

export default function SuperAdminProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data: profile, isLoading, error } = useProfile();


  // LOADING
    if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={{ marginTop: 10 }}>Loading profile...</Text>
        </View>
      );
    }

     // ERROR
      if (error || !profile) {
        return (
          <View style={styles.center}>
            <Text>Profile not available</Text>
          </View>
        );
      }
    


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f242a" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HEADER ================= */}
        <View style={styles.topHeader}>
          <View style={styles.profileRow}>
           <View style={styles.avatarContainer}>
              {profile?.avatar?.startsWith("http") ? (
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={44} color="#94A3B8" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile?.name || "Owner"}</Text>
              <Text style={styles.email}>
                {profile?.email || "No email provided"}
              </Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile?.role? "Owner": "No Role"}</Text>
            </View>
          </View>
        </View>

        {/* ================= ACCOUNT INFO ================= */}
        <Section title="Account Information" />

        <Card>
          <InfoRow label="Full Name" value={profile?.name || "-"} />
          <InfoRow label="Email" value={profile?.email || "-"} />
          <InfoRow label="Phone" value={profile?.phone || "-"} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/dashboard/ownerDashboard/profile/edit")}
          >
            <Text style={styles.linkText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#2563EB" />
          </TouchableOpacity>
        </Card>

        {/* ================= ACCESS ================= */}
        <Section title="Platform Access" />

        <Card>
          {[
            "Create Branches",
            "Manage Branches",
            "Manage Staffs and Admins",
            "View Subscriptions and Billing",
            "Make Subscriptions",
            // "Access Analytics",
          ].map((item) => (
            <InfoRow key={item} label={item} value="Granted" highlight />
          ))}
        </Card>

        {/* ================= SECURITY ================= */}
        {/* <Section title="Security" /> */}

        {/* <Card>
          <ActionRow
            label="Change Password"
            onPress={() => router.push("/superAdmin/changePassword")}
          />

          <ActionRow
            label="Enable 2FA"
            onPress={() => router.push("/superAdmin/enable2fa")}
          />

          <ActionRow label="Logout All Devices" />
        </Card> */}

        {/* ================= TOOLS ================= */}
        {/* <Section title="Platform Tools" /> */}

        {/* <Card>
          <ActionRow label="System Logs" />
          <ActionRow label="Audit Trail" />
          <ActionRow label="Platform Settings" />
        </Card> */}

        {/* ================= LOGOUT ================= */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav dashboardType="owner" />
    </View>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

interface SectionProps {
  title: string;
}

const Section: React.FC<SectionProps> = ({ title }) => (
  <Text style={styles.section}>{title}</Text>
);

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  highlight = false,
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, highlight && styles.highlight]}>
      {value}
    </Text>
  </View>
);

interface ActionRowProps {
  label: string;
  onPress?: () => void;
}

const ActionRow: React.FC<ActionRowProps> = ({
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress}>
    <Text style={styles.label}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  topHeader: {
    backgroundColor: "#0EA5E9",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

avatar: {
  width: 20,
  height: 20,
  borderRadius: 50,
  marginRight: 15,
  borderWidth: 2,
  borderColor: "white", // ✅ changed
},

  name: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
  },

  email: {
    color: "#0F172A",
    fontSize: 13,
    marginTop: 2,
  },

 roleBadge: {
  backgroundColor: "#0F172A", // ✅ changed
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
  marginTop: 8,
  alignSelf: "flex-start",
},

  roleText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },

  activeDot: {
  backgroundColor: "#0F172A", // ✅ changed
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 20,
},

  activeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },

  section: {
    marginTop: 25,
    marginBottom: 10,
    marginHorizontal: 20,
    fontWeight: "700",
    fontSize: 15,
    color: "#1E293B",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  label: {
    color: "#0F172A",
    fontWeight: "500",
  },

  value: {
    color: "#64748B",
    fontWeight: "600",
  },

  highlight: {
    color: "#0F172A",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },

  linkText: {
    color: "#0F172A",
    fontWeight: "600",
  },

  logoutBtn: {
    backgroundColor: "#e92618",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },

  avatarContainer: {
  width: 60,
  height: 60,
  borderRadius: 50,
  backgroundColor: "#E2E8F0",
  justifyContent: "center",
  alignItems: "center",
},
});


