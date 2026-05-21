import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useBranchStaff } from "@/hooks/useBranchStaff";

/* ================= TYPES ================= */
type Staff = {
  _id: string;
  name: string;
  email: string;
  departmentOrUnit?: string;
  isActive?: boolean;
  createdAt?: string;
};

/* ================= MAIN ================= */
export default function StaffList() {
  const router = useRouter();

  const { institutionId, branchId } =
    useLocalSearchParams<{
      institutionId: string;
      branchId: string;
    }>();

  const {
    data: staffList = [],
    isLoading,
    refetch,
  } = useBranchStaff(branchId);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "disabled"
  >("all");

  /* ================= FILTER ================= */
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff: Staff) => {
      const matchesSearch =
        staff.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        staff.email
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && staff.isActive) ||
        (filter === "disabled" && !staff.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [staffList, search, filter]);

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.title}>Branch Staff</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push({
              pathname:
                "/dashboard/superAdminDashboard/institution/[institutionId]/branches/[branchId]/staff/invites/inviteOptions",
              params: { institutionId, branchId },
            })
          }
        >
          <Ionicons
            name="person-add-outline"
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search staff..."
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={16}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER BUTTONS */}
      <View style={styles.filterRow}>
        {["all", "active", "disabled"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterBtn,
              filter === item &&
                styles.activeFilterBtn,
            ]}
            onPress={() => setFilter(item as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item &&
                  styles.activeFilterText,
              ]}
            >
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TOTAL */}
      <View style={styles.totalWrapper}>
        <Text style={styles.totalText}>
          Total Staff: {filteredStaff.length}
        </Text>
      </View>

      {/* LOADING */}
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#0284C7"
        />
      )}

      {/* EMPTY */}
      {!isLoading && filteredStaff.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No staff found
        </Text>
      )}

      {/* STAFF LIST */}
      {filteredStaff.map((staff: Staff) => (
        <StaffCard
          key={staff._id}
          staff={staff}
          onPress={() =>
            router.push({
              pathname:
                "/dashboard/superAdminDashboard/institution/[institutionId]/branches/[branchId]/staff/profile",
              params: {
                institutionId,
                branchId,
                staff: JSON.stringify(staff),
              },
            })
          }
        />
      ))}
    </ScrollView>
  );
}

/* ================= STAFF CARD ================= */
function StaffCard({
  staff,
  onPress,
}: {
  staff: Staff;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {staff.name
              ?.charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View>
          <Text style={styles.name}>
            {staff.name}
          </Text>
          <Text style={styles.email}>
            {staff.email}
          </Text>

          <View style={styles.metaRow}>
            {staff.departmentOrUnit && (
              <Text style={styles.subject}>
                • {staff.departmentOrUnit}
              </Text>
            )}

            <View
              style={[
                styles.statusBadge,
                staff.isActive
                  ? styles.activeBadge
                  : styles.disabledBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  staff.isActive
                    ? styles.activeText
                    : styles.disabledText,
                ]}
              >
                {staff.isActive
                  ? "ACTIVE"
                  : "DISABLED"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
      />
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

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 46,
    marginBottom: 12,
  },

  searchInput: { flex: 1, marginLeft: 8 },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },

  activeFilterBtn: {
    backgroundColor: "#0284C7",
  },

  filterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  activeFilterText: {
    color: "#fff",
  },

  totalWrapper: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },

  totalText: { fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  left: { flexDirection: "row", gap: 12 },

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
  subject: { fontSize: 11, color: "#0284C7" },

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

