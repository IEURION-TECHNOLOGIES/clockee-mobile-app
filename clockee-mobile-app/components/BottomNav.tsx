import { Feather, Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, useLocalSearchParams } from "expo-router";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useProfile } from "@/hooks/useProfile";   // ← Added

type dashboardType = "superAdmin" | "owner" | "admin" | "staff";

type NavItem = {
  key: string;
  match: string;
  icon:
    | { type: "ion"; name: keyof typeof Ionicons.glyphMap }
    | { type: "feather"; name: keyof typeof Feather.glyphMap };
  path: string;
};

type BottomNavProps = {
  dashboardType: dashboardType;
};

export default function BottomNav({ dashboardType }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { institutionId: paramInstitutionId, branchId } =
    useLocalSearchParams<{ institutionId?: string; branchId?: string }>();

  // Get institutionId from profile as fallback (more reliable)
  const { data: profile } = useProfile();
  const institutionId = paramInstitutionId || profile?.institutionId;

  const base = `/dashboard/${dashboardType}Dashboard`;

  /* ================= NAV ITEMS ================= */

  const SUPER_ADMIN_NAV: NavItem[] = [
    { key: "overview", match: "overview", icon: { type: "ion", name: "grid-outline" }, path: `${base}/overview/Overview` },
    { key: "institutions", match: "institution", icon: { type: "ion", name: "business-outline" }, path: `${base}/institution/institutionList` },
    { key: "users", match: "users", icon: { type: "ion", name: "people-outline" }, path: `${base}/users` },
    { key: "payments", match: "payments", icon: { type: "ion", name: "card-outline" }, path: `${base}/payments` },
    { key: "profile", match: "profile", icon: { type: "ion", name: "person-outline" }, path: `${base}/profile` },
  ];

  const PRIMARY_ADMIN_NAV: NavItem[] = [
    { key: "overview", match: "overview", icon: { type: "ion", name: "grid-outline" }, path: `${base}/overview/Overview` },
    {
      key: "institution",
      match: "institution",
      icon: { type: "ion", name: "git-branch-outline" },
      path: institutionId ? `${base}/institution/${institutionId}` : `${base}/overview/Overview`, // Fallback
    },
    // { key: "subscription", match: "subscription", icon: { type: "ion", name: "card-outline" }, path: `${base}/subscription` },
    { key: "profile", match: "profile", icon: { type: "ion", name: "person-outline" }, path: `${base}/profile` },
  ];

  const ADMIN_NAV: NavItem[] = [
    { key: "overview", match: "overview", icon: { type: "ion", name: "grid-outline" }, path: `${base}/overview/Overview` },

    { key: "institution", match: "institution", icon: { type: "ion", name: "people-outline" }, path: `${base}/institution/${institutionId}` },

    // { key: "subscription", match: "subscription", icon: { type: "ion", name: "card-outline" }, path: `${base}/subscription` },

    { key: "profile", match: "profile", icon: { type: "ion", name: "person-outline" }, path: `${base}/profile` },
  ];

  const STAFF_NAV: NavItem[] = [
    { key: "overview", match: "overview", icon: { type: "ion", name: "grid-outline" }, path: `${base}/overview` },
    { key: "clockin", match: "clockIn", icon: { type: "feather", name: "clock" }, path: `${base}/clockIn/clockIn` },
    { key: "profile", match: "profile", icon: { type: "ion", name: "person-outline" }, path: `${base}/profile` },
  ];

  const NAV_ITEMS =
    dashboardType === "superAdmin"
      ? SUPER_ADMIN_NAV
      : dashboardType === "owner"
      ? PRIMARY_ADMIN_NAV
      : dashboardType === "admin"
      ? ADMIN_NAV
      : STAFF_NAV;

  const handlePress = (item: NavItem) => {
    if (!item.path || item.path.includes("undefined")) {
      console.warn("Invalid navigation path for:", item.key);
      return;
    }
    router.replace(item.path);
  };

  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.includes(`/${item.match}`);

        const color = isActive ? "#0ba6f3ff" : "#94A3B8";

        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
            style={[styles.navItem, isActive && styles.activeItem]}
          >
            {item.icon.type === "ion" ? (
              <Ionicons name={item.icon.name} size={22} color={color} />
            ) : (
              <Feather name={item.icon.name} size={22} color={color} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  navItem: {
    padding: 8,
    alignItems: "center",
  },
  activeItem: {
    transform: [{ scale: 1.1 }],
  },
});
