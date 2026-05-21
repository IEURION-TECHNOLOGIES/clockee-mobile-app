import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  demoteToStaff,
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  logoutUser,
  getAdminByInstitution,
} from "@/services/superAdminServices";
import UserActionModal from "@/components/UserActionModal";

/* ================= TYPES ================= */
type Admin = {
  id: string;
  name: string;
  email: string;
  role: "Primary Admin" | "Admin";
  status: "active" | "disabled";
  branch?: string;
};

type AdminAction =
  | "PROMOTE"
  | "DEMOTE"
  | "RESET"
  | "ACTIVATE"
  | "DEACTIVATE"
  | "REMOVE";

/* ================= MAIN ================= */
export default function AdminsTab() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "primary" | "admin" | "active" | "disabled"
  >("all");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState<AdminAction | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);

 /* ================= FETCH ADMINS ================= */
const fetchAdmins = async () => {
  try {
    if (!institutionId) return;

    setLoading(true);

    const res = await getAdminByInstitution(institutionId as string);

    // Most likely backend returns users
    const data = res?.data?.users || res?.data?.data || [];

    const formatted: Admin[] = data.map((item: any) => ({
      id: item._id,
      name: item.name,
      email: item.email,
      role: item.role === "PRIMARY" ? "Primary Admin" : "Admin",
      status: item.isActive ? "active" : "disabled",
      branch: item.branch || undefined,
    }));

    setAdmins(formatted);
  } catch (error) {
    console.log("Fetch Admins Error:", error);
  } finally {
    setLoading(false);
  }
};

/* ================= ACTION HANDLERS ================= */

const handleDemote = async () => {
  if (!selectedAdmin?.id) return;

  const res = await demoteToStaff(selectedAdmin.id);
  return res;
};

/* ================= FULL ACTION HANDLERS ================= */

const handleDeactivate = async () => {
  if (!selectedAdmin?.id) return;
  return await deactivateUser(selectedAdmin.id);
};

const handleReactivate = async () => {
  if (!selectedAdmin?.id) return;
  return await reactivateUser(selectedAdmin.id);
};

const handleResetPassword = async () => {
  if (!selectedAdmin?.id) return;
  return await resetUserPassword(selectedAdmin.id);
};

const handleLogout = async () => {
  if (!selectedAdmin?.id) return;
  return await logoutUser(selectedAdmin.id);
};

const refreshAdmins = useCallback(() => {
  fetchAdmins();
}, [institutionId]);

  useFocusEffect(
    useCallback(() => {
      if (institutionId) fetchAdmins();
    }, [institutionId])
  );

  /* ================= FILTER LOGIC ================= */
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(search.toLowerCase()) ||
        admin.email.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "primary" && admin.role === "Primary Admin") ||
        (filter === "admin" && admin.role === "Admin") ||
        (filter === "active" && admin.status === "active") ||
        (filter === "disabled" && admin.status === "disabled");

      return matchesSearch && matchesFilter;
    });
  }, [admins, search, filter]);

  return (
    <View>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Institution Admins</Text>

          {/* <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              router.push(
                `/dashboard/superAdminDashboard/institution/${institutionId}/admins/createAdmin`
              )
            }
          >
            <Ionicons name="person-add-outline" size={18} color="#fff" />
          </TouchableOpacity> */}
        </View>

        {/* SEARCH + FILTER */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search admins..."
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Ionicons name="filter" size={16} color="#0284C7" />
            <Text style={styles.filterLabel}>{filter.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* TOTAL */}
        <View style={styles.totalWrapper}>
          <Text style={styles.totalText}>
            Total Admins: {admins.length}
          </Text>
        </View>

        {/* LOADING */}
        {loading && (
          <ActivityIndicator size="large" color="#0284C7" />
        )}

        {/* ADMIN LIST */}
        {filteredAdmins.map((admin) => (
          <AdminCard
            key={admin.id}
            admin={admin}
            onCardPress={() =>
            router.push({
              pathname:
                "/dashboard/ownerDashboard/institution/[institutionId]/admins/[staffId]",
              params: {
                institutionId: institutionId as string,
                staffId: admin.id, // ✅ correct
              },
            })
          }
            onMenuPress={() => {
              setSelectedAdmin(admin);
              setShowActions(true);
            }}
          />
        ))}
      </ScrollView>


      {/* ================= USER ACTION MODAL ================= */}

      <UserActionModal
        visible={showActions}
        role="admin"
        status={selectedAdmin?.status === "active" ? "active" : "inactive"}
        onClose={() => {
          setShowActions(false);
          setSelectedAdmin(null);
        }}
        onRefresh={refreshAdmins}
        onDemote={handleDemote}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onResetPassword={handleResetPassword}
        onLogout={handleLogout}
      />
    </View>
  );
}

/* ================= ADMIN CARD ================= */
function AdminCard({
  admin,
  onCardPress,
  onMenuPress,
}: {
  admin: Admin;
  onCardPress: () => void;
  onMenuPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.adminCard} onPress={onCardPress}>
      <View style={styles.adminLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {admin.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View>
          <Text style={styles.name}>{admin.name}</Text>
          <Text style={styles.email}>{admin.email}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.role}>{admin.role}</Text>

            <View
              style={[
                styles.statusBadge,
                admin.status === "active"
                  ? styles.activeBadge
                  : styles.disabledBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  admin.status === "active"
                    ? styles.activeText
                    : styles.disabledText,
                ]}
              >
                {admin.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#94A3B8"
            />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 16, marginTop: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  title: { fontSize: 16, fontWeight: "700" },

  addBtn: {
    backgroundColor: "#0284C7",
    padding: 10,
    borderRadius: 10,
  },

  searchFilterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    alignItems: "center",
  },

  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 46,
  },

  searchInput: { flex: 1, marginLeft: 8 },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 14,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0284C7",
  },

  totalWrapper: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },

  totalText: { fontWeight: "700" },

  adminCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  adminLeft: { flexDirection: "row", gap: 12 },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: { fontWeight: "700", color: "#0284C7" },

  name: { fontWeight: "700" },
  email: { fontSize: 12, color: "#64748B" },

  metaRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  role: { fontSize: 11 },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  statusText: { fontSize: 10, fontWeight: "700" },

  activeBadge: { backgroundColor: "#DCFCE7" },
  activeText: { color: "#166534" },

  disabledBadge: { backgroundColor: "#FEE2E2" },
  disabledText: { color: "#991B1B" },
});