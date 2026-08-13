// ======================= SuperAdminProfile.tsx =======================

import React from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { useProfile } from "@/hooks/useProfile";
import BottomNav from "../../../../components/BottomNav";
import { useAuth } from "../../../../context/AuthContext";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  primary: "#0284C7",
  primaryDark: "#0369A1",
  primaryLight: "#E0F2FE",
  success: "#047857",
  successLight: "#ECFDF5",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  purple: "#7C3AED",
};

type IconName = keyof typeof Ionicons.glyphMap;

export default function SuperAdminProfile() {
  const router = useRouter();
  const { logout } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
  } = useProfile();

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading profile
          </Text>

          <Text style={styles.loadingText}>
            Retrieving your account information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="person-remove-outline"
              size={35}
              color={COLORS.danger}
            />
          </View>

          <Text style={styles.errorTitle}>
            Profile unavailable
          </Text>

          <Text style={styles.errorMessage}>
            We could not load your profile information.
          </Text>

          <Pressable
            style={styles.backHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeText}>
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const name =
    profile?.name || "Administrator";

  const firstName =
    name.trim().split(" ")[0] ||
    "Administrator";

  const role = getProfileRole(profile);

  const accountStatus =
    profile?.accountStatus ||
    profile?.status ||
    "active";

  const isActive =
    String(accountStatus).toLowerCase() ===
    "active";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerEyebrow}>
                ADMIN ACCOUNT
              </Text>

              <Text style={styles.headerTitle}>
                My profile
              </Text>
            </View>

            <View style={styles.headerAction}>
              <Ionicons
                name="settings-outline"
                size={21}
                color={COLORS.white}
              />
            </View>
          </View>

          {/* PROFILE HERO */}

          <View style={styles.profileHero}>
            <View style={styles.profileIdentity}>
              <View style={styles.personIcon}>
                <Ionicons
                  name="person"
                  size={35}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.identityText}>
                <Text style={styles.profileName}>
                  {name}
                </Text>

                <Text style={styles.profileEmail}>
                  {profile?.email ||
                    "No email provided"}
                </Text>
              </View>
            </View>

            <View style={styles.profileBadges}>
              <View style={styles.roleBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={13}
                  color={COLORS.primaryDark}
                />

                <Text style={styles.roleBadgeText}>
                  {role}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isActive
                      ? COLORS.successLight
                      : COLORS.dangerLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isActive
                        ? COLORS.success
                        : COLORS.danger,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: isActive
                        ? COLORS.success
                        : COLORS.danger,
                    },
                  ]}
                >
                  {formatStatus(accountStatus)}
                </Text>
              </View>
            </View>
          </View>

          {/* ACCOUNT INFORMATION */}

          <SectionHeader
            icon="person-outline"
            title="Account information"
            subtitle="Your personal account details"
          />

          <View style={styles.card}>
            <ProfileRow
              icon="person-outline"
              label="Full name"
              value={profile?.name || "--"}
            />

            <ProfileRow
              icon="mail-outline"
              label="Email address"
              value={profile?.email || "--"}
            />

            <ProfileRow
              icon="call-outline"
              label="Phone number"
              value={profile?.phone || "--"}
            />

            <ProfileRow
              icon="business-outline"
              label="Institution"
              value={
                profile?.institutionName ||
                "--"
              }
              last
            />

            <Pressable
              style={styles.editButton}
              onPress={() =>
                router.push(
                  "/dashboard/adminDashboard/profile/edit"
                )
              }
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={COLORS.white}
              />

              <Text style={styles.editButtonText}>
                Edit profile
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.white}
              />
            </Pressable>
          </View>

          {/* PLATFORM ACCESS */}

          <SectionHeader
            icon="shield-checkmark-outline"
            title="Platform access"
            subtitle="Permissions available to your account"
          />

          <View style={styles.card}>
            <AccessRow
              icon="business-outline"
              title="Manage branches"
              description="Create and manage institution branches"
              granted
            />

            <AccessRow
              icon="people-outline"
              title="Manage staff"
              description="View and manage staff accounts"
              granted
            />

            <AccessRow
              icon="analytics-outline"
              title="View attendance reports"
              description="Access attendance and work summaries"
              granted
              last
            />
          </View>

          {/* SECURITY */}

          <SectionHeader
            icon="lock-closed-outline"
            title="Security"
            subtitle="Keep your account protected"
          />

          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color={COLORS.success}
              />
            </View>

            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>
                Account security
              </Text>

              <Text style={styles.securityText}>
                Your account access and personal information are securely protected.
              </Text>
            </View>
          </View>

          {/* LOGOUT */}

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={COLORS.danger}
            />

            <Text style={styles.logoutText}>
              Log out of account
            </Text>
          </Pressable>

          <Text style={styles.versionText}>
            Account settings
          </Text>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <BottomNav dashboardType="admin" />
      </View>
    </SafeAreaView>
  );
}

/* ================= COMPONENTS ================= */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={COLORS.primary}
        />
      </View>

      <View>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.profileRow,
        !last && styles.rowBorder,
      ]}
    >
      <View style={styles.rowIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>
          {label}
        </Text>

        <Text style={styles.rowValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function AccessRow({
  icon,
  title,
  description,
  granted,
  last = false,
}: {
  icon: IconName;
  title: string;
  description: string;
  granted: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.accessRow,
        !last && styles.rowBorder,
      ]}
    >
      <View style={styles.accessIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.accessContent}>
        <Text style={styles.accessTitle}>
          {title}
        </Text>

        <Text style={styles.accessDescription}>
          {description}
        </Text>
      </View>

      <View
        style={[
          styles.grantedBadge,
          {
            backgroundColor: granted
              ? COLORS.successLight
              : COLORS.dangerLight,
          },
        ]}
      >
        <Ionicons
          name={
            granted
              ? "checkmark"
              : "close"
          }
          size={13}
          color={
            granted
              ? COLORS.success
              : COLORS.danger
          }
        />

        <Text
          style={[
            styles.grantedText,
            {
              color: granted
                ? COLORS.success
                : COLORS.danger,
            },
          ]}
        >
          {granted ? "Granted" : "Denied"}
        </Text>
      </View>
    </View>
  );
}

/* ================= HELPERS ================= */

function getProfileRole(profile: any) {
  if (profile?.role) {
    if (Array.isArray(profile.role)) {
      return profile.role
        .map((item: string) =>
          formatStatus(item)
        )
        .join(" · ");
    }

    return formatStatus(profile.role);
  }

  if (profile?.roles?.length) {
    return profile.roles
      .map((item: string) =>
        formatStatus(item)
      )
      .join(" · ");
  }

  return "Administrator";
}

function formatStatus(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingBottom: 120,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },

  loadingIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 23,
  },

  loadingTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  loadingText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
  },

  errorIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerLight,
    borderRadius: 23,
  },

  errorTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  errorMessage: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
  },

  backHomeButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },

  backHomeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    backgroundColor: COLORS.primaryDark,
  },

  headerBackButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 14,
  },

  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    color: "#BAE6FD",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerTitle: {
    marginTop: 3,
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },

  headerAction: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 14,
  },

  profileHero: {
    marginTop: -1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 21,
    backgroundColor: COLORS.primaryDark,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  profileIdentity: {
    flexDirection: "row",
    alignItems: "center",
  },

  personIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 24,
  },

  identityText: {
    flex: 1,
    marginLeft: 13,
  },

  profileName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },

  profileEmail: {
    marginTop: 5,
    color: "#BAE6FD",
    fontSize: 11,
  },

  profileBadges: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },

  roleBadgeText: {
    marginLeft: 5,
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: "900",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 4,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 18,
    marginBottom: 10,
  },

  sectionIcon: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 11,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  card: {
    marginHorizontal: 18,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 65,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  rowIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 11,
  },

  rowText: {
    flex: 1,
    marginLeft: 10,
  },

  rowLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },

  rowValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginTop: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
  },

  editButtonText: {
    marginHorizontal: 7,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  accessRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 73,
  },

  accessIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },

  accessContent: {
    flex: 1,
    marginLeft: 10,
  },

  accessTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  accessDescription: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
  },

  grantedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 9,
  },

  grantedText: {
    marginLeft: 3,
    fontSize: 9,
    fontWeight: "900",
  },

  securityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    padding: 14,
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 17,
  },

  securityIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 13,
  },

  securityContent: {
    flex: 1,
    marginLeft: 10,
  },

  securityTitle: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "900",
  },

  securityText: {
    marginTop: 4,
    color: "#166534",
    fontSize: 10,
    lineHeight: 15,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 51,
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 15,
  },

  logoutText: {
    marginLeft: 7,
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "900",
  },

  versionText: {
    marginTop: 15,
    color: COLORS.subtle,
    fontSize: 10,
    textAlign: "center",
  },

  bottomSpace: {
    height: 20,
  },
});
