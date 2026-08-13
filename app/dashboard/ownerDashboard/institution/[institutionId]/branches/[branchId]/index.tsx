import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useBranchStaff } from "@/hooks/useBranchStaff";

type BranchData = {
  _id?: string;
  name?: string;
  address?: string;
  status?: string;
  radiusMeters?: number;
  location?: {
    coordinates?: number[];
  };
};

export default function BranchProfile() {
  const router = useRouter();

  const {
    institutionId,
    branchId,
    branch: branchParam,
  } = useLocalSearchParams<{
    institutionId: string;
    branchId: string;
    branch?: string;
  }>();

  const [menuVisible, setMenuVisible] =
    useState(false);

  const [branchStatus, setBranchStatus] =
    useState<"active" | "disabled">("active");

  const slideAnim = useRef(
    new Animated.Value(20)
  ).current;

  /* ================= PARSE BRANCH ================= */

  const branch: BranchData = useMemo(() => {
    if (branchParam) {
      try {
        return JSON.parse(branchParam);
      } catch (parseError) {
        console.log(
          "Failed to parse branch data:",
          parseError
        );
      }
    }

    return {
      _id: branchId,
      name: "Branch",
      address: "",
      status: "active",
    };
  }, [branchParam, branchId]);

  /* ================= STAFF ================= */

  const {
    data: staffList = [],
    isLoading: staffLoading,
    refetch,
  } = useBranchStaff(branchId);

  /* ================= STATUS ================= */

  React.useEffect(() => {
    const status =
      branch.status?.toLowerCase() === "disabled"
        ? "disabled"
        : "active";

    setBranchStatus(status);
  }, [branch.status]);

  /* ================= SPLIT STAFF ================= */

  const { adminList, staffOnlyList } =
    useMemo(() => {
      const admins: any[] = [];
      const staffMembers: any[] = [];

      staffList.forEach((member: any) => {
        const roles = Array.isArray(member.role)
          ? member.role
          : [member.role].filter(Boolean);

        const isAdmin = roles.some((role: string) =>
          role?.toLowerCase().includes("admin")
        );

        if (isAdmin) {
          admins.push(member);
        } else {
          staffMembers.push(member);
        }
      });

      return {
        adminList: admins,
        staffOnlyList: staffMembers,
      };
    }, [staffList]);

  const totalAdmins = adminList.length;
  const totalStaff = staffOnlyList.length;
  const totalPeople = totalAdmins + totalStaff;

  const previewAdmins = adminList.slice(0, 5);
  const previewStaff = staffOnlyList.slice(0, 5);

  const showViewAllAdmins = totalAdmins > 5;
  const showViewAllStaff = totalStaff > 5;

  /* ================= REFRESH STAFF ================= */

  useFocusEffect(
    useCallback(() => {
      if (branchId) {
        refetch();
      }
    }, [branchId, refetch])
  );

  /* ================= MENU ================= */

  const openBranchMenu = () => {
    setMenuVisible(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeBranchMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const handleToggleStatus = () => {
    setBranchStatus((previousStatus) =>
      previousStatus === "active"
        ? "disabled"
        : "active"
    );

    closeBranchMenu();
  };

  const handleDeleteBranch = () => {
    closeBranchMenu();

    setTimeout(() => {
      alert("Delete branch functionality coming soon");
    }, 200);
  };

  /* ================= ROUTES ================= */

  const openAssignStaff = () => {
    closeBranchMenu();

    router.push({
      pathname:
        "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]/staff/invites/inviteOptions",
      params: {
        institutionId,
        branchId,
      },
    });
  };

  const openEditBranch = () => {
    closeBranchMenu();

    router.push({
      pathname:
        "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]/edit",
      params: {
        institutionId,
        branchId,
      },
    });
  };

  const openAdminProfile = (admin: any) => {
    router.push({
      pathname:
        "/dashboard/ownerDashboard/institution/[institutionId]/admins/[staffId]",
      params: {
        institutionId,
        staffId: admin._id,
      },
    });
  };

  const openStaffProfile = (staff: any) => {
    router.push({
      pathname:
        "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]/staff/[staffId]",
      params: {
        institutionId,
        branchId,
        staffId: staff._id,
        staff: JSON.stringify(staff),
      },
    });
  };

  const branchIsActive = branchStatus === "active";

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
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={10}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              Branch profile
            </Text>

            <Pressable
              style={styles.headerMenuButton}
              onPress={openBranchMenu}
              hitSlop={10}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <View style={styles.headerBranchContent}>
            <View style={styles.branchIcon}>
              <Ionicons
                name="business-outline"
                size={31}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.headerBranchName}>
              {branch.name || "Branch"}
            </Text>

            <View style={styles.headerStatusBadge}>
              <View
                style={[
                  styles.headerStatusDot,
                  branchIsActive
                    ? styles.activeDot
                    : styles.disabledDot,
                ]}
              />

              <Text style={styles.headerStatusText}>
                {branchIsActive
                  ? "ACTIVE"
                  : "DISABLED"}
              </Text>
            </View>
          </View>

          <View style={styles.headerDecorationOne} />
          <View style={styles.headerDecorationTwo} />
        </LinearGradient>

        {/* ================= SUMMARY CARD ================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryAddressRow}>
            <View style={styles.summaryAddressIcon}>
              <Ionicons
                name="location-outline"
                size={19}
                color="#0284C7"
              />
            </View>

            <View style={styles.summaryAddressContent}>
              <Text style={styles.summaryLabel}>
                Branch address
              </Text>

              <Text
                style={[
                  styles.summaryAddress,
                  !branch.address &&
                    styles.mutedAddress,
                ]}
                numberOfLines={2}
              >
                {branch.address ||
                  "No address added yet"}
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {totalPeople}
              </Text>

              <Text style={styles.summaryStatLabel}>
                People
              </Text>
            </View>

            <View style={styles.summaryStatDivider} />

            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {totalAdmins}
              </Text>

              <Text style={styles.summaryStatLabel}>
                Admins
              </Text>
            </View>

            <View style={styles.summaryStatDivider} />

            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {totalStaff}
              </Text>

              <Text style={styles.summaryStatLabel}>
                Staff
              </Text>
            </View>
          </View>
        </View>

        {/* ================= QUICK ACTIONS ================= */}

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickActionCard}
            onPress={openAssignStaff}
          >
            <View style={styles.quickActionIconBlue}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color="#0284C7"
              />
            </View>

            <Text style={styles.quickActionTitle}>
              Assign staff
            </Text>

            <Text style={styles.quickActionSubtitle}>
              Add team members
            </Text>
          </Pressable>

          <Pressable
            style={styles.quickActionCard}
            onPress={openEditBranch}
          >
            <View style={styles.quickActionIconPurple}>
              <Ionicons
                name="create-outline"
                size={20}
                color="#7C3AED"
              />
            </View>

            <Text style={styles.quickActionTitle}>
              Edit branch
            </Text>

            <Text style={styles.quickActionSubtitle}>
              Update branch details
            </Text>
          </Pressable>
        </View>

        {/* ================= ADMIN SECTION ================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Admins in charge
              </Text>

              <Text style={styles.sectionSubtitle}>
                People responsible for managing this branch.
              </Text>
            </View>

            {showViewAllAdmins && (
              <Pressable
                onPress={() => {
                  // Add your admin list route here.
                }}
              >
                <Text style={styles.viewAllText}>
                  View all
                </Text>
              </Pressable>
            )}
          </View>

          {staffLoading ? (
            <View style={styles.sectionLoader}>
              <ActivityIndicator
                size="small"
                color="#0284C7"
              />
            </View>
          ) : previewAdmins.length > 0 ? (
            previewAdmins.map((admin: any) => (
              <Pressable
                key={admin._id}
                style={styles.adminCard}
                onPress={() => openAdminProfile(admin)}
              >
                <View style={styles.personAvatarBlue}>
                  <Text style={styles.avatarText}>
                    {getInitials(admin.name)}
                  </Text>
                </View>

                <View style={styles.personInfo}>
                  <Text
                    style={styles.personName}
                    numberOfLines={1}
                  >
                    {admin.name || "Unnamed admin"}
                  </Text>

                  <Text style={styles.personSecondary}>
                    Branch administrator
                  </Text>
                </View>

                <View style={styles.adminBadge}>
                  <Ionicons
                    name="shield-checkmark"
                    size={13}
                    color="#0284C7"
                  />

                  <Text style={styles.adminBadgeText}>
                    ADMIN
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#94A3B8"
                />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="shield-outline"
                  size={25}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No admins assigned
              </Text>

              <Text style={styles.emptySubtitle}>
                Assign an administrator to manage this branch.
              </Text>

              <Pressable
                style={styles.emptyAction}
                onPress={openAssignStaff}
              >
                <Text style={styles.emptyActionText}>
                  Assign admin
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ================= STAFF SECTION ================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Staff members
              </Text>

              <Text style={styles.sectionSubtitle}>
                Team members assigned to this branch.
              </Text>
            </View>

            {showViewAllStaff && (
              <Pressable
                onPress={() => {
                  // Add your staff list route here.
                }}
              >
                <Text style={styles.viewAllText}>
                  View all
                </Text>
              </Pressable>
            )}
          </View>

          {staffLoading ? (
            <View style={styles.sectionLoader}>
              <ActivityIndicator
                size="small"
                color="#0284C7"
              />
            </View>
          ) : previewStaff.length > 0 ? (
            previewStaff.map((staff: any) => {
              const staffIsActive =
                (staff.status || "active") ===
                "active";

              return (
                <Pressable
                  key={staff._id}
                  style={styles.staffCard}
                  onPress={() => openStaffProfile(staff)}
                >
                  <View
                    style={[
                      styles.personAvatar,
                      staffIsActive
                        ? styles.personAvatarGreen
                        : styles.personAvatarGray,
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(staff.name)}
                    </Text>
                  </View>

                  <View style={styles.personInfo}>
                    <Text
                      style={styles.personName}
                      numberOfLines={1}
                    >
                      {staff.name || "Unnamed staff"}
                    </Text>

                    <Text
                      style={styles.personSecondary}
                      numberOfLines={1}
                    >
                      {formatRole(staff.role)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      staffIsActive
                        ? styles.activeBadge
                        : styles.disabledBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusBadgeDot,
                        staffIsActive
                          ? styles.activeDot
                          : styles.disabledDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusBadgeText,
                        staffIsActive
                          ? styles.activeText
                          : styles.disabledText,
                      ]}
                    >
                      {staffIsActive
                        ? "ACTIVE"
                        : "DISABLED"}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                  />
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="people-outline"
                  size={25}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No staff members yet
              </Text>

              <Text style={styles.emptySubtitle}>
                Assign staff members to start managing this branch.
              </Text>

              <Pressable
                style={styles.emptyAction}
                onPress={openAssignStaff}
              >
                <Text style={styles.emptyActionText}>
                  Assign staff
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ================= MENU MODAL ================= */}

      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeBranchMenu}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeBranchMenu}
          />

          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [
                  {
                    translateY: slideAnim,
                  },
                ],
              },
            ]}
          >
            <View style={styles.menuHandle} />

            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.menuTitle}>
                  Branch actions
                </Text>

                <Text style={styles.menuSubtitle}>
                  Manage this branch
                </Text>
              </View>

              <Pressable
                style={styles.menuCloseButton}
                onPress={closeBranchMenu}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.menuItem}
              onPress={openAssignStaff}
            >
              <View style={styles.menuItemIconBlue}>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color="#0284C7"
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  Assign staff
                </Text>

                <Text style={styles.menuItemSubtitle}>
                  Add admins or staff members
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#94A3B8"
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={openEditBranch}
            >
              <View style={styles.menuItemIconPurple}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#7C3AED"
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  Edit branch
                </Text>

                <Text style={styles.menuItemSubtitle}>
                  Update name, address, or location
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#94A3B8"
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={handleToggleStatus}
            >
              <View style={styles.menuItemIconOrange}>
                <Ionicons
                  name={
                    branchIsActive
                      ? "pause-outline"
                      : "play-outline"
                  }
                  size={20}
                  color="#EA580C"
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  {branchIsActive
                    ? "Disable branch"
                    : "Activate branch"}
                </Text>

                <Text style={styles.menuItemSubtitle}>
                  Change the branch availability status
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#94A3B8"
              />
            </Pressable>

            <Pressable
              style={[
                styles.menuItem,
                styles.dangerMenuItem,
              ]}
              onPress={handleDeleteBranch}
            >
              <View style={styles.menuItemIconRed}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#DC2626"
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text
                  style={[
                    styles.menuItemTitle,
                    styles.dangerText,
                  ]}
                >
                  Delete branch
                </Text>

                <Text style={styles.menuItemSubtitle}>
                  Permanently remove this branch
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#FCA5A5"
              />
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= HELPERS ================= */

function getInitials(name?: string) {
  if (!name) {
    return "BR";
  }

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatRole(role: any) {
  if (Array.isArray(role)) {
    return role.join(", ") || "Staff";
  }

  return role || "Staff";
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    minHeight: 260,
    paddingTop: Platform.OS === "ios" ? 58 : 43,
    paddingHorizontal: 18,
    paddingBottom: 38,
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

  headerMenuButton: {
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
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  headerBranchContent: {
    zIndex: 2,
    alignItems: "center",
    marginTop: 27,
  },

  branchIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 20,
  },

  headerBranchName: {
    maxWidth: 330,
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
  },

  headerStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderRadius: 12,
  },

  headerStatusDot: {
    width: 7,
    height: 7,
    marginRight: 6,
    borderRadius: 5,
  },

  activeDot: {
    backgroundColor: "#22C55E",
  },

  disabledDot: {
    backgroundColor: "#F97316",
  },

  headerStatusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  headerDecorationOne: {
    position: "absolute",
    width: 240,
    height: 240,
    top: -110,
    right: -70,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 130,
  },

  headerDecorationTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    top: 30,
    left: -65,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 70,
  },

  summaryCard: {
    marginHorizontal: 18,
    marginTop: -22,
    padding: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 21,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  summaryAddressRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryAddressIcon: {
    width: 41,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 13,
  },

  summaryAddressContent: {
    flex: 1,
    marginLeft: 11,
  },

  summaryLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  summaryAddress: {
    marginTop: 4,
    color: "#0F172A",
    fontSize: 13,
    lineHeight: 18,
  },

  mutedAddress: {
    color: "#94A3B8",
  },

  summaryDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "#F1F5F9",
  },

  summaryStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  summaryStat: {
    flex: 1,
    alignItems: "center",
  },

  summaryStatValue: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "900",
  },

  summaryStatLabel: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },

  summaryStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },

  quickActions: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 14,
  },

  quickActionCard: {
    flex: 1,
    minHeight: 112,
    padding: 13,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 17,
  },

  quickActionCardLast: {
    marginRight: 0,
  },

  quickActionIconBlue: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#E0F2FE",
    borderRadius: 11,
  },

  quickActionIconPurple: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#F5F3FF",
    borderRadius: 11,
  },

  quickActionTitle: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "900",
  },

  quickActionSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 14,
  },

  section: {
    marginHorizontal: 18,
    marginTop: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    maxWidth: 270,
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
  },

  viewAllText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "800",
  },

  sectionLoader: {
    alignItems: "center",
    paddingVertical: 26,
  },

  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    padding: 12,
    marginBottom: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 16,
  },

  staffCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    padding: 12,
    marginBottom: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
  },

  personAvatar: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },

  personAvatarBlue: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 15,
  },

  personAvatarGreen: {
    backgroundColor: "#DCFCE7",
  },

  personAvatarGray: {
    backgroundColor: "#F1F5F9",
  },

  avatarText: {
    color: "#0369A1",
    fontSize: 14,
    fontWeight: "900",
  },

  personInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  personName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  personSecondary: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
  },

  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },

  adminBadgeText: {
    marginLeft: 4,
    color: "#0284C7",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 8,
    borderRadius: 8,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  disabledBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusBadgeDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 4,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  activeText: {
    color: "#166534",
  },

  disabledText: {
    color: "#B91C1C",
  },

  emptyCard: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 17,
  },

  emptyTitle: {
    marginTop: 11,
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
  },

  emptySubtitle: {
    maxWidth: 250,
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },

  emptyAction: {
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
  },

  emptyActionText: {
    color: "#0284C7",
    fontSize: 11,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 20,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.42)",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  menuContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 15,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: -5,
    },
  },

  menuHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    marginBottom: 17,
    backgroundColor: "#CBD5E1",
    borderRadius: 5,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  menuTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  menuSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
  },

  menuCloseButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 11,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  dangerMenuItem: {
    borderBottomWidth: 0,
  },

  menuItemIconBlue: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 13,
  },

  menuItemIconPurple: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3FF",
    borderRadius: 13,
  },

  menuItemIconOrange: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 13,
  },

  menuItemIconRed: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 13,
  },

  menuItemContent: {
    flex: 1,
    marginLeft: 11,
  },

  menuItemTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },

  menuItemSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
  },

  dangerText: {
    color: "#DC2626",
  },
});
