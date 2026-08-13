import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BottomNav from "../../../../components/BottomNav";
import { useAuth } from "../../../../context/AuthContext";
import { useProfile } from "@/hooks/useProfile";


type Profile = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string | string[];
  avatar?: string;
  status?: string;
  dashboardType?: string;
};

type PermissionItem = {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const permissions: PermissionItem[] = [
  {
    label: "Create branches",
    description: "Add new workplace locations",
    icon: "business-outline",
  },
  {
    label: "Manage branches",
    description: "Update branch details and locations",
    icon: "map-outline",
  },
  {
    label: "Manage staff and admins",
    description: "Assign and manage team members",
    icon: "people-outline",
  },
  {
    label: "View subscriptions and billing",
    description: "Review billing information",
    icon: "card-outline",
  },
  {
    label: "Make subscriptions",
    description: "Manage subscription plans",
    icon: "receipt-outline",
  },
];

export default function SuperAdminProfile() {
  const router = useRouter();

  const { logout } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
  } = useProfile();

  const typedProfile = profile as Profile | undefined;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator
          size="large"
          color="#0284C7"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (error || !typedProfile) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="person-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Profile unavailable
        </Text>

        <Text style={styles.errorMessage}>
          We could not load your profile information.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const displayName =
    typedProfile.name || "Owner";

  const displayEmail =
    typedProfile.email || "No email provided";

  const displayPhone =
    typedProfile.phone || "No phone number added";

  const displayRole = formatRole(
    typedProfile.role
  );

  const isActive =
    !typedProfile.status ||
    typedProfile.status.toLowerCase() === "active";

  const avatarIsValid =
    typeof typedProfile.avatar === "string" &&
    typedProfile.avatar.startsWith("http");

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#075985"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HEADER ================= */}

        <LinearGradient
          colors={["#075985", "#0284C7", "#0EA5E9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>
              My profile
            </Text>

            <Pressable
              style={styles.headerActionButton}
              onPress={() =>
                router.push(
                  "/dashboard/ownerDashboard/profile/edit"
                )
              }
              hitSlop={10}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarWrapper}>
              {avatarIsValid ? (
                <Image
                  source={{
                    uri: typedProfile.avatar,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(displayName)}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.onlineIndicator,
                  isActive
                    ? styles.onlineIndicatorActive
                    : styles.onlineIndicatorInactive,
                ]}
              />
            </View>

            <Text style={styles.profileName}>
              {displayName}
            </Text>

            <Text style={styles.profileEmail}>
              {displayEmail}
            </Text>

            <View style={styles.headerBadges}>
              <View style={styles.roleBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={13}
                  color="#FFFFFF"
                />

                <Text style={styles.roleBadgeText}>
                  OWNER
                </Text>
              </View>

              <View style={styles.accountStatusBadge}>
                <View
                  style={[
                    styles.accountStatusDot,
                    isActive
                      ? styles.accountStatusDotActive
                      : styles.accountStatusDotInactive,
                  ]}
                />

                <Text style={styles.accountStatusText}>
                  {isActive ? "ACTIVE" : "DISABLED"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerCircleOne} />
          <View style={styles.headerCircleTwo} />
        </LinearGradient>

        {/* ================= PROFILE SUMMARY ================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="person-circle-outline"
              size={23}
              color="#0284C7"
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>
              Account overview
            </Text>

            <Text style={styles.summaryText}>
              Manage your personal details and platform access
              from this profile.
            </Text>
          </View>

          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#10B981"
          />
        </View>

        {/* ================= ACCOUNT INFORMATION ================= */}

        <SectionHeader
          title="Account information"
          subtitle="Your personal account details"
          icon="person-outline"
          iconColor="#0284C7"
          iconBackground="#E0F2FE"
        />

        <View style={styles.card}>
          <InfoRow
            icon="person-outline"
            label="Full name"
            value={displayName}
          />

          <InfoRow
            icon="mail-outline"
            label="Email address"
            value={displayEmail}
          />

          <InfoRow
            icon="call-outline"
            label="Phone number"
            value={displayPhone}
          />

          <View style={styles.cardDivider} />

          <Pressable
            style={styles.editProfileButton}
            onPress={() =>
              router.push(
                "/dashboard/ownerDashboard/profile/edit"
              )
            }
          >
            <View style={styles.editProfileIcon}>
              <Ionicons
                name="create-outline"
                size={17}
                color="#2563EB"
              />
            </View>

            <Text style={styles.editProfileText}>
              Edit profile
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#2563EB"
            />
          </Pressable>
        </View>

        {/* ================= PLATFORM ACCESS ================= */}

        <SectionHeader
          title="Platform access"
          subtitle="Permissions available to your account"
          icon="key-outline"
          iconColor="#7C3AED"
          iconBackground="#F5F3FF"
        />

        <View style={styles.card}>
          {permissions.map((permission, index) => (
            <PermissionRow
              key={permission.label}
              item={permission}
              isLast={
                index === permissions.length - 1
              }
            />
          ))}
        </View>

        {/* ================= SECURITY ================= */}

        <SectionHeader
          title="Security"
          subtitle="Keep your account protected"
          icon="shield-checkmark-outline"
          iconColor="#059669"
          iconBackground="#ECFDF5"
        />

        <View style={styles.card}>
          <Pressable
            style={styles.securityRow}
            onPress={() => {
              // Add change-password route when available.
            }}
          >
            <View style={styles.securityIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#059669"
              />
            </View>

            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>
                Change password
              </Text>

              <Text style={styles.securitySubtitle}>
                Update your account password
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#94A3B8"
            />
          </Pressable>

          <View style={styles.cardDivider} />

          <View style={styles.securityInfo}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#2563EB"
            />

            <Text style={styles.securityInfoText}>
              Use a strong password and avoid sharing your login
              details with anyone.
            </Text>
          </View>
        </View>

        {/* ================= LOGOUT ================= */}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <View style={styles.logoutIcon}>
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#DC2626"
            />
          </View>

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>

        <Text style={styles.versionText}>
          Clockee account settings
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNav dashboardType="owner" />
    </View>
  );
}

/* ================= SECTION HEADER ================= */

type SectionHeaderProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

function SectionHeader({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionHeaderIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={iconColor}
        />
      </View>

      <View style={styles.sectionHeaderContent}>
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

/* ================= INFO ROW ================= */

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({
  icon,
  label,
  value,
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowIcon}>
        <Ionicons
          name={icon}
          size={17}
          color="#0284C7"
        />
      </View>

      <View style={styles.infoRowContent}>
        <Text style={styles.infoRowLabel}>
          {label}
        </Text>

        <Text
          style={styles.infoRowValue}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ================= PERMISSION ROW ================= */

type PermissionRowProps = {
  item: PermissionItem;
  isLast: boolean;
};

function PermissionRow({
  item,
  isLast,
}: PermissionRowProps) {
  return (
    <View
      style={[
        styles.permissionRow,
        !isLast && styles.permissionRowBorder,
      ]}
    >
      <View style={styles.permissionIcon}>
        <Ionicons
          name={item.icon}
          size={18}
          color="#7C3AED"
        />
      </View>

      <View style={styles.permissionContent}>
        <Text style={styles.permissionTitle}>
          {item.label}
        </Text>

        <Text style={styles.permissionDescription}>
          {item.description}
        </Text>
      </View>

      <View style={styles.grantedBadge}>
        <Ionicons
          name="checkmark"
          size={13}
          color="#059669"
        />

        <Text style={styles.grantedText}>
          Granted
        </Text>
      </View>
    </View>
  );
}

/* ================= HELPERS ================= */

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatRole(
  role?: string | string[]
) {
  if (Array.isArray(role)) {
    return role.join(", ") || "Owner";
  }

  if (!role) {
    return "Owner";
  }

  return role.replace("_", " ");
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingBottom: 125,
  },

  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 11,
    color: "#64748B",
    fontSize: 13,
  },

  errorIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 18,
  },

  errorTitle: {
    marginTop: 15,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  errorMessage: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: "#0284C7",
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  header: {
    minHeight: 315,
    paddingTop: Platform.OS === "ios" ? 58 : 43,
    paddingHorizontal: 20,
    paddingBottom: 42,
    overflow: "hidden",
    position: "relative",
  },

  headerTopRow: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 14,
  },

  headerActionButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 14,
  },

  headerTitle: {
    color: "#E0F2FE",
    fontSize: 15,
    fontWeight: "800",
  },

  profileHeaderContent: {
    zIndex: 2,
    alignItems: "center",
    marginTop: 27,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 13,
  },

  avatar: {
    width: 78,
    height: 78,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 39,
  },

  avatarFallback: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 39,
  },

  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  onlineIndicator: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 17,
    height: 17,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 10,
  },

  onlineIndicatorActive: {
    backgroundColor: "#22C55E",
  },

  onlineIndicatorInactive: {
    backgroundColor: "#F97316",
  },

  profileName: {
    maxWidth: 340,
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },

  profileEmail: {
    marginTop: 5,
    color: "#E0F2FE",
    fontSize: 13,
  },

  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(15,23,42,0.75)",
    borderRadius: 10,
  },

  roleBadgeText: {
    marginLeft: 5,
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  accountStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 10,
  },

  accountStatusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 4,
  },

  accountStatusDotActive: {
    backgroundColor: "#22C55E",
  },

  accountStatusDotInactive: {
    backgroundColor: "#F97316",
  },

  accountStatusText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  headerCircleOne: {
    position: "absolute",
    width: 250,
    height: 250,
    top: -120,
    right: -75,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 130,
  },

  headerCircleTwo: {
    position: "absolute",
    width: 140,
    height: 140,
    top: 30,
    left: -75,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 80,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: -24,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 19,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  summaryIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 13,
  },

  summaryContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  summaryTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
  },

  summaryText: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 23,
    marginBottom: 11,
  },

  sectionHeaderIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
  },

  card: {
    marginHorizontal: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 19,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 57,
  },

  infoRowIcon: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 11,
  },

  infoRowContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoRowLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  infoRowValue: {
    marginTop: 4,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 53,
  },

  editProfileIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
  },

  editProfileText: {
    flex: 1,
    marginLeft: 10,
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "800",
  },

  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    paddingVertical: 8,
  },

  permissionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  permissionIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3FF",
    borderRadius: 11,
  },

  permissionContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  permissionTitle: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "800",
  },

  permissionDescription: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 14,
  },

  grantedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
  },

  grantedText: {
    marginLeft: 3,
    color: "#047857",
    fontSize: 9,
    fontWeight: "900",
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
  },

  securityIcon: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 11,
  },

  securityContent: {
    flex: 1,
    marginLeft: 10,
  },

  securityTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },

  securitySubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  securityInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 13,
  },

  securityInfoText: {
    flex: 1,
    marginLeft: 6,
    color: "#2563EB",
    fontSize: 11,
    lineHeight: 16,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 53,
    marginHorizontal: 18,
    marginTop: 23,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 15,
  },

  logoutIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
  },

  logoutText: {
    marginLeft: 8,
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "900",
  },

  versionText: {
    marginTop: 14,
    color: "#94A3B8",
    fontSize: 10,
    textAlign: "center",
  },

  bottomSpace: {
    height: 25,
  },
});
