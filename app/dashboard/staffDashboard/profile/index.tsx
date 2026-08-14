import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import BottomNav from "../../../../components/BottomNav";
import { useAuth } from "../../../../context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

import logo from "../../../../assets/images/splash/clockee_logo.png";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  soft: "#F1F5F9",
  border: "#E5E7EB",
  primary: "#0093DD",
  primarySoft: "#EFF6FF",
  green: "#059669",
  greenSoft: "#ECFDF5",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  dark: "#0093DD",
};

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

  const safeProfile: any =
    profile || {};

  const name =
    safeProfile?.name || "Staff member";

  const email =
    safeProfile?.email || "No email provided";

  const role =
    formatText(
      safeProfile?.role?.[0]
    ) || "Staff";

  const staffId =
    safeProfile?.studentOrStaffId ||
    safeProfile?.employeeNumber ||
    "Not provided";

 const avatar =
  safeProfile?.avatar &&
  safeProfile.avatar.startsWith("http")
    ? { uri: safeProfile.avatar }
    : null;

  const hasBasicProfile =
    Boolean(
      safeProfile?.name &&
        safeProfile?.email &&
        safeProfile?.phone &&
        safeProfile?.address
    );

  const profilePercentage =
    hasBasicProfile ? 100 : 70;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* TOP BAR */}

        <View style={styles.topBar}>
          <View>
            <Text style={styles.topLabel}>
              MY PROFILE
            </Text>

            <Text style={styles.topTitle}>
              Personal account
            </Text>
          </View>

          <Pressable
            style={styles.topAction}
            onPress={() =>
              router.push(
                "/dashboard/staffDashboard/profile/edit"
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={COLORS.primary}
            />
          </Pressable>
        </View>

        {/* PROFILE HERO */}

        <View style={styles.profileHero}>
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />

          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={avatar} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholder]}>
                  <Ionicons name="person" size={48} color="#777" />
                </View>
              )}

              <View style={styles.activeDot}>
                <Ionicons
                  name="checkmark"
                  size={10}
                  color={COLORS.white}
                />
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator
                color={COLORS.white}
                style={styles.heroLoader}
              />
            ) : (
              <>
                <Text style={styles.heroName}>
                  {name}
                </Text>

                <Text style={styles.heroEmail}>
                  {email}
                </Text>

                <View style={styles.heroRole}>
                  <Ionicons
                    name="person-outline"
                    size={13}
                    color="#BFDBFE"
                  />

                  <Text style={styles.heroRoleText}>
                    {role}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* PROFILE IDENTITY */}

        <View style={styles.identityCard}>
          <View style={styles.identityItem}>
            <Text style={styles.identityLabel}>
              STAFF ID
            </Text>

            <Text style={styles.identityValue}>
              {staffId}
            </Text>
          </View>

          <View style={styles.identityDivider} />

          <View style={styles.identityItem}>
            <Text style={styles.identityLabel}>
              ACCOUNT
            </Text>

            <View style={styles.activeStatus}>
              <View style={styles.activeStatusDot} />

              <Text style={styles.activeStatusText}>
                {formatText(
                  safeProfile?.accountStatus ||
                    "Active"
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* ERROR */}

        {error && (
          <Pressable
            style={styles.errorBox}
            onPress={() => refetch()}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.danger}
            />

            <Text style={styles.errorText}>
              Profile update failed. Tap to retry.
            </Text>

            <Ionicons
              name="refresh-outline"
              size={17}
              color={COLORS.danger}
            />
          </Pressable>
        )}

        {/* COMPLETION */}

        <View style={styles.completionCard}>
          <View style={styles.completionTop}>
            <View>
              <Text style={styles.completionTitle}>
                Profile completeness
              </Text>

              <Text style={styles.completionSubtitle}>
                Keep your information up to date
              </Text>
            </View>

            <Text style={styles.completionPercentage}>
              {profilePercentage}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${profilePercentage}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* PERSONAL PROFILE */}

        <ProfileSection
          icon="person-outline"
          title="Personal details"
          subtitle="Your personal contact information"
        >
          <ProfileDetail
            icon="person-outline"
            label="Full name"
            value={safeProfile?.name}
          />

          <ProfileDetail
            icon="mail-outline"
            label="Email address"
            value={safeProfile?.email}
          />

          <ProfileDetail
            icon="call-outline"
            label="Phone number"
            value={safeProfile?.phone}
          />

          <ProfileDetail
            icon="location-outline"
            label="Home address"
            value={safeProfile?.address}
            last
          />
        </ProfileSection>

        {/* STAFF PROFILE */}

        <ProfileSection
          icon="briefcase-outline"
          title="Staff information"
          subtitle="Your workplace identity"
        >
          <ProfileDetail
            icon="id-card-outline"
            label="Staff ID"
            value={staffId}
          />

          <ProfileDetail
            icon="business-outline"
            label="Department"
            value={
              safeProfile?.departmentOrUnit ||
              safeProfile?.department
            }
          />

          <ProfileDetail
            icon="school-outline"
            label="Institution"
            value={
              safeProfile?.institutionName
            }
          />

          <ProfileDetail
            icon="shield-checkmark-outline"
            label="Role"
            value={role}
            last
          />
        </ProfileSection>

        {/* ACCOUNT PREFERENCES */}

        <ProfileSection
          icon="options-outline"
          title="Account preferences"
          subtitle="Your attendance preferences"
        >
          <ProfileDetail
            icon="time-outline"
            label="Clock mode"
            value={safeProfile?.clockMode}
          />

          <ProfileDetail
            icon="globe-outline"
            label="Remote access"
            value={
              safeProfile?.remoteAccess?.allowed
                ? "Allowed"
                : "Not allowed"
            }
            valueColor={
              safeProfile?.remoteAccess?.allowed
                ? COLORS.green
                : COLORS.muted
            }
          />

          <ProfileDetail
            icon="location-outline"
            label="Location access"
            value={
              safeProfile?.locationAccess?.allowed
                ? "Allowed"
                : safeProfile?.locationAccess
                  ? "Not allowed"
                  : undefined
            }
            last
          />
        </ProfileSection>

        {/* EDIT BUTTON */}

        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push(
              "/dashboard/staffDashboard/profile/edit"
            )
          }
        >
          <View style={styles.editButtonIcon}>
            <Ionicons
              name="create-outline"
              size={21}
              color={COLORS.white}
            />
          </View>

          <View style={styles.editButtonText}>
            <Text style={styles.editButtonTitle}>
              Edit profile
            </Text>

            <Text style={styles.editButtonSubtitle}>
              Change your personal information
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.white}
          />
        </Pressable>

        {/* LOGOUT */}

        {/* <Pressable
          style={styles.logoutButton}
          onPress={logout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={COLORS.danger}
          />

          <Text style={styles.logoutText}>
            Log out
          </Text>
        </Pressable> */}

        <Text style={styles.footerText}>
          Your profile information is used to manage your Clockee attendance account.
        </Text>
      </ScrollView>

      <BottomNav dashboardType="staff" />
    </View>
  );
}

/* ================= COMPONENTS ================= */

function ProfileSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
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

      <View style={styles.detailsCard}>
        {children}
      </View>
    </View>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
  valueColor,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: unknown;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && styles.detailBorder,
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={COLORS.muted}
      />

      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text
          style={[
            styles.detailValue,
            valueColor
              ? { color: valueColor }
              : null,
          ]}
        >
          {formatValue(value)}
        </Text>
      </View>
    </View>
  );
}

/* ================= HELPERS ================= */

function formatValue(value: unknown) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Allowed" : "Not allowed";
  }

  return String(value);
}

function formatText(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },

  content: {
    paddingBottom: 120,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 15,
  },

  topLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  topTitle: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },

  topAction: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 13,
  },

  profileHero: {
    height: 260,
    marginHorizontal: 18,
    overflow: "hidden",
    backgroundColor: COLORS.dark,
    borderRadius: 28,
  },

  heroContent: {
    zIndex: 2,
    alignItems: "center",
    paddingTop: 25,
  },

  heroCircleLarge: {
    position: "absolute",
    right: -65,
    bottom: -100,
    width: 260,
    height: 260,
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    borderRadius: 150,
  },

  heroCircleSmall: {
    position: "absolute",
    left: -70,
    top: -80,
    width: 190,
    height: 190,
    borderWidth: 1,
    borderColor: "#FFFFFF12",
    borderRadius: 120,
  },

  avatarContainer: {
    position: "relative",
  },
  

  avatar: {
    width: 94,
    height: 94,
    borderWidth: 4,
    borderColor: "#FFFFFF40",
    borderRadius: 47,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e5e5",
  },

  activeDot: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.green,
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 14,
  },

  heroLoader: {
    marginTop: 17,
  },

  heroName: {
    marginTop: 12,
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
  },

  heroEmail: {
    marginTop: 4,
    color: "#CBD5E1",
    fontSize: 12,
  },

  heroRole: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF18",
    borderWidth: 1,
    borderColor: "#FFFFFF25",
    borderRadius: 20,
  },

  heroRoleText: {
    marginLeft: 5,
    color: "#BFDBFE",
    fontSize: 11,
    fontWeight: "800",
  },

  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 30,
    marginTop: -25,
    padding: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  identityItem: {
    flex: 1,
  },

  identityDivider: {
    width: 1,
    height: 34,
    marginHorizontal: 10,
    backgroundColor: COLORS.border,
  },

  identityLabel: {
    color: COLORS.faint,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  identityValue: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },

  activeStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  activeStatusDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    backgroundColor: COLORS.green,
    borderRadius: 5,
  },

  activeStatusText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "900",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 15,
    padding: 12,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#FECDCA",
    borderRadius: 14,
  },

  errorText: {
    flex: 1,
    marginHorizontal: 8,
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "700",
  },

  completionCard: {
    marginHorizontal: 18,
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  completionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  completionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  completionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
  },

  completionPercentage: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },

  progressTrack: {
    height: 8,
    marginTop: 14,
    overflow: "hidden",
    backgroundColor: COLORS.soft,
    borderRadius: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },

  section: {
    marginTop: 23,
    paddingHorizontal: 18,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
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

  detailsCard: {
    marginTop: 11,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 65,
  },

  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.soft,
  },

  detailText: {
    flex: 1,
    marginLeft: 11,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },

  detailValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 25,
    padding: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },

  editButtonIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF25",
    borderRadius: 11,
  },

  editButtonText: {
    flex: 1,
    marginLeft: 10,
  },

  editButtonTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  editButtonSubtitle: {
    marginTop: 3,
    color: "#BFDBFE",
    fontSize: 10,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 18,
    marginTop: 13,
    paddingVertical: 14,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#FECDCA",
    borderRadius: 15,
  },

  logoutText: {
    marginLeft: 7,
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "900",
  },

  footerText: {
    marginHorizontal: 40,
    marginTop: 18,
    color: COLORS.faint,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },
});
