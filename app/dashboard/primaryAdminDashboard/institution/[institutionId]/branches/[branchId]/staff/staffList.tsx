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
  Modal,
} from "react-native";

/* ================= TYPES ================= */
type Staff = {
  id: string;
  name: string;
  email: string;
  role: "Teacher" | "Administration" | "Support";
  subject?: string;
  status: "active" | "disabled";
  branch?: string;
};

type StaffAction = "RESET" | "ACTIVATE" | "DEACTIVATE" | "REMOVE";

/* ================= MAIN ================= */
export default function StaffTab() {
  const router = useRouter();
  const { institutionId, branchId } =
    useLocalSearchParams<{ institutionId: string; branchId: string }>();

  if (!institutionId) return null;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "teacher" | "admin" | "support" | "active" | "disabled"
  >("all");
  const [showFilter, setShowFilter] = useState(false);

  const [staffList, setStaffList] = useState<Staff[]>([
    {
      id: "1",
      name: "Sarah James",
      email: "sarah@greenwood.com",
      role: "Teacher",
      subject: "Mathematics",
      status: "active",
    },
    {
      id: "2",
      name: "Daniel Smart",
      email: "daniel@greenwood.com",
      role: "Administration",
      status: "active",
      branch: "Main Campus",
    },
    {
      id: "3",
      name: "Grace Kelvin",
      email: "grace@greenwood.com",
      role: "Support",
      status: "disabled",
    },
  ]);

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState<StaffAction | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);

  /* ================= FILTER ================= */
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(search.toLowerCase()) ||
        staff.email.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "teacher" && staff.role === "Teacher") ||
        (filter === "admin" && staff.role === "Administration") ||
        (filter === "support" && staff.role === "Support") ||
        (filter === "active" && staff.status === "active") ||
        (filter === "disabled" && staff.status === "disabled");

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, staffList]);

  /* ================= ACTION HANDLER ================= */
  const handleConfirmAction = () => {
    if (!selectedStaff || !confirmAction) return;

    if (confirmAction === "ACTIVATE") {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === selectedStaff.id ? { ...s, status: "active" } : s
        )
      );
    }

    if (confirmAction === "DEACTIVATE") {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === selectedStaff.id ? { ...s, status: "disabled" } : s
        )
      );
    }

    if (confirmAction === "REMOVE") {
      setStaffList((prev) =>
        prev.filter((s) => s.id !== selectedStaff.id)
      );
    }

    setShowConfirm(false);
    setShowResult(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Branch Staff</Text>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              router.push(
                `/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/${branchId}/staff/invites/inviteOptions`
              )
            }
          >
            <Ionicons name="person-add-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SEARCH + FILTER */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search staff..."
              style={styles.searchInput}
            />
          </View>

          <View style={{ position: "relative" }}>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setShowFilter(!showFilter)}
            >
              <Ionicons name="filter" size={16} color="#0284C7" />
              <Text style={styles.filterLabel}>
                {filter.toUpperCase()}
              </Text>
            </TouchableOpacity>

            {showFilter && (
              <View style={styles.dropdown}>
                {[
                  { key: "all", label: "All" },
                  { key: "teacher", label: "Teachers" },
                  { key: "admin", label: "Administration" },
                  { key: "support", label: "Support" },
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
                    <Text style={styles.dropdownText}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* TOTAL */}
        <View style={styles.totalWrapper}>
          <Text style={styles.totalText}>
            Total Staff: {staffList.length}
          </Text>
        </View>

        {/* STAFF LIST */}
        {filteredStaff.map((staff) => (
          <TouchableOpacity
            key={staff.id}
            style={styles.adminCard}
            onPress={() =>
              router.push(
                `/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/${branchId}/staff/${staff.id}`
              )
            }
          >
            <View style={styles.adminLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {staff.name.charAt(0)}
                </Text>
              </View>

              <View>
                <Text style={styles.name}>{staff.name}</Text>
                <Text style={styles.email}>{staff.email}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.role}>{staff.role}</Text>

                  {staff.role === "Teacher" && staff.subject && (
                    <Text style={styles.branchText}>
                      • Teaching {staff.subject}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.statusBadge,
                      staff.status === "active"
                        ? styles.activeBadge
                        : styles.disabledBadge,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {staff.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setSelectedStaff(staff);
                setShowActions(true);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={18} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ================= ACTION SHEET ================= */}
      <Modal visible={showActions} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.actionSheet}>
            <Text style={styles.sheetTitle}>
              {selectedStaff?.name}
            </Text>

            {selectedStaff?.status === "active" ? (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setConfirmAction("DEACTIVATE");
                  setShowActions(false);
                  setShowConfirm(true);
                }}
              >
                <Text style={styles.actionText}>Deactivate</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setConfirmAction("ACTIVATE");
                  setShowActions(false);
                  setShowConfirm(true);
                }}
              >
                <Text style={styles.actionText}>Activate</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setConfirmAction("RESET");
                setShowActions(false);
                setShowConfirm(true);
              }}
            >
              <Text style={styles.actionText}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setConfirmAction("REMOVE");
                setShowActions(false);
                setShowConfirm(true);
              }}
            >
              <Text style={[styles.actionText, { color: "red" }]}>
                Remove Staff
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowActions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= CONFIRM MODAL ================= */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Confirm {confirmAction}
            </Text>

            <View style={styles.confirmRow}>
              <TouchableOpacity onPress={() => setShowConfirm(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmAction}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= RESULT MODAL ================= */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.resultBox}>
            <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
            <Text style={styles.resultTitle}>Action Successful</Text>

            <TouchableOpacity
              style={[styles.confirmBtn, { marginTop: 16 }]}
              onPress={() => setShowResult(false)}
            >
              <Text style={styles.confirmBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  disabledBadge: { backgroundColor: "#FEE2E2" },

  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  actionSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  sheetTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  actionItem: {
    paddingVertical: 14,
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

  totalText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#334155",
  },
});