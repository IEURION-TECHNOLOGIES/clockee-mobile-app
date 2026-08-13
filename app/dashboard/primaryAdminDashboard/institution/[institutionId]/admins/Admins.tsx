import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
} from "react-native";

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
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  if (!institutionId) return null;

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

  /* ================= MOCK DATA ================= */
  const admins: Admin[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@greenwood.com",
      role: "Primary Admin",
      status: "active",
    },
    {
      id: "2",
      name: "Mary Johnson",
      email: "mary@greenwood.com",
      role: "Admin",
      status: "active",
      branch: "Ikeja Branch",
    },
    {
      id: "3",
      name: "Peter Smith",
      email: "peter@greenwood.com",
      role: "Admin",
      status: "disabled",
      branch: "VI Branch",
    },
  ];

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
  }, [search, filter]);

  return (
    <ScrollView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Text style={styles.title}>Institution Admins</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push(
              `/dashboard/primaryAdminDashboard/institution/${institutionId}/admins/createAdmin`
            )
          }
        >
          <Ionicons name="person-add-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ================= SEARCH + FILTER ================= */}
      <View style={styles.searchFilterRow}>
        {/* SEARCH */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search admins..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTER */}
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Ionicons name="filter" size={16} color="#0284C7" />
            <Text style={styles.filterLabel}>{filter.toUpperCase()}</Text>
            <Ionicons
              name={showFilter ? "chevron-up" : "chevron-down"}
              size={14}
              color="#64748B"
            />
          </TouchableOpacity>

          {showFilter && (
            <View style={styles.dropdown}>
              {[
                { key: "all", label: "All" },
                { key: "primary", label: "Primary Admin" },
                { key: "admin", label: "Admins" },
                { key: "active", label: "Active" },
                { key: "disabled", label: "Disabled" },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilter(f.key as any);
                    setShowFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      filter === f.key && {
                        fontWeight: "800",
                        color: "#0284C7",
                      },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

     <View style={styles.totalWrapper}>
        <Text style={styles.totalText}>
          Total Admin:{" "}
          <Text style={styles.totalValue}>
            {admins.length}{" "}
             Admins
          </Text>
        </Text>
      </View>

      {/* ================= ADMIN LIST ================= */}
      {filteredAdmins.map((admin) => (
        <AdminCard
          key={admin.id}
          admin={admin}
          onCardPress={() =>
            router.push(
              `/dashboard/primaryAdminDashboard/institution/${institutionId}/admins/${admin.id}`
            )
          }
          onMenuPress={() => {
            setSelectedAdmin(admin);
            setShowActions(true);
          }}
        />
      ))}

      {/* ================= ACTION SHEET ================= */}
      {showActions && selectedAdmin && (
        <View style={styles.overlay}>
          <View style={styles.actionSheet}>
            <Text style={styles.sheetTitle}>{selectedAdmin.name}</Text>

            <ActionItem
              icon={
                selectedAdmin.role === "Admin"
                  ? "arrow-up-circle-outline"
                  : "arrow-down-circle-outline"
              }
              label={
                selectedAdmin.role === "Admin"
                  ? "Promote to Primary Admin"
                  : "Demote to Admin"
              }
              color="#0284C7"
              onPress={() => {
                setConfirmAction(
                  selectedAdmin.role === "Admin" ? "PROMOTE" : "DEMOTE"
                );
                setShowActions(false);
                setShowConfirm(true);
              }}
            />

            <ActionItem
              icon="refresh-outline"
              label="Reset Account"
              color="#0EA5E9"
              onPress={() => {
                setConfirmAction("RESET");
                setShowActions(false);
                setShowConfirm(true);
              }}
            />

            <ActionItem
              icon={
                selectedAdmin.status === "active"
                  ? "pause-circle-outline"
                  : "play-circle-outline"
              }
              label={
                selectedAdmin.status === "active"
                  ? "Deactivate Admin"
                  : "Activate Admin"
              }
              color={
                selectedAdmin.status === "active" ? "#EF4444" : "#16A34A"
              }
              onPress={() => {
                setConfirmAction(
                  selectedAdmin.status === "active"
                    ? "DEACTIVATE"
                    : "ACTIVATE"
                );
                setShowActions(false);
                setShowConfirm(true);
              }}
            />

            <ActionItem
              icon="trash-outline"
              label="Remove Admin"
              color="#DC2626"
              onPress={() => {
                setConfirmAction("REMOVE");
                setShowActions(false);
                setShowConfirm(true);
              }}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowActions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= CONFIRM ================= */}
      {showConfirm && (
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Confirm Action</Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setShowConfirm(false);
                  setShowResult(true);
                }}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ================= RESULT ================= */}
      {showResult && (
        <View style={styles.overlay}>
          <View style={styles.resultBox}>
            <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
            <Text style={styles.resultTitle}>Success</Text>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setShowResult(false)}
            >
              <Text style={styles.confirmBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
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
          <Text style={styles.avatarText}>{admin.name.charAt(0)}</Text>
        </View>

        <View>
          <Text style={styles.name}>{admin.name}</Text>
          <Text style={styles.email}>{admin.email}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.role}>{admin.role}</Text>
            {admin.branch && (
              <Text style={styles.branchText}>({admin.branch})</Text>
            )}
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

      <TouchableOpacity onPress={onMenuPress}>
        <Ionicons name="ellipsis-vertical" size={18} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* ================= ACTION ITEM ================= */
function ActionItem({
  icon,
  label,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
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

  /* SEARCH + FILTER */
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

  dropdown: {
    position: "absolute",
    top: 52,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 180,
    elevation: 4,
    zIndex: 20,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dropdownText: { fontSize: 12 },

  /* ADMIN CARD */
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
  branchText: { fontSize: 11, color: "#0284C7", fontWeight: "600" },

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

  /* MODALS */
  overlay: {
    position: "absolute",
    inset: 0,
    // backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionText: { fontWeight: "600" },
  cancelBtn: { alignItems: "center", marginTop: 8 },
  cancelText: { fontWeight: "700", color: "#64748B" },

  confirmBox: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 18,
    margin: 24,
  },
  confirmTitle: { fontWeight: "700", marginBottom: 12, textAlign: "center" },
  confirmRow: { flexDirection: "row", justifyContent: "space-between" },
  confirmBtn: {
    backgroundColor: "#0284C7",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmBtnText: { color: "#fff", fontWeight: "700" },

  resultBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
    margin: 24,
  },
  resultTitle: { fontWeight: "700", marginTop: 10 },
  totalWrapper: {
  backgroundColor: "#F1F5F9",
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 12,
  marginBottom: 14,
},

// totalWrapper: {
//   backgroundColor: "#F1F5F9",
//   paddingVertical: 10,
//   paddingHorizontal: 14,
//   borderRadius: 12,
//   marginBottom: 14,
// },

totalText: {
  fontSize: 16,
  fontWeight: "800",
  color: "#334155",
},

totalValue: {
  fontSize: 14,
  fontWeight: "400",
  // color: "#0284C7", // highlight color
},
});