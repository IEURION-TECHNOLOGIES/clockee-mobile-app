import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";

import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";
import { useBranchStaff } from "@/hooks/useBranchStaff";

type Branch = {
  _id: string;
  name: string;
  status?: "active" | "disabled" | string;
};

/* ================= BRANCH CARD COMPONENT ================= */
function BranchCard({
  branch,
  institutionId,
  router,
}: {
  branch: Branch;
  institutionId: string;
  router: any;
}) {
const { data: branchStaff = [], isLoading } = useBranchStaff(branch._id);

const { totalAdmins, totalStaff } = React.useMemo(() => {
  let admins = 0;
  let staff = 0;

  branchStaff.forEach((member: any) => {
    const isAdmin = Array.isArray(member.role)
      ? member.role.some((r: string) =>
          r?.toLowerCase().includes("admin")
        )
      : typeof member.role === "string"
      ? member.role.toLowerCase().includes("admin")
      : false;

    if (isAdmin) {
      admins++;
    } else {
      staff++;
    }
  });

  return { totalAdmins: admins, totalStaff: staff };
}, [branchStaff]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname:
            "/dashboard/ownerDashboard/institution/[institutionId]/branches/[branchId]",
          params: {
            institutionId,
            branchId: branch._id,
            branch: JSON.stringify(branch),
          },
        })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.branchName}>{branch.name}</Text>

        <Text style={styles.branchMeta}>
          {isLoading
            ? "Loading staff..."
            : `${totalAdmins} Admin • ${totalStaff} Staff`}
        </Text>

        {/* 🔥 HORIZONTAL STAFF */}
        {branchStaff.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
          >
            {/* {branchStaff.map((member: any) => (
              <View key={member._id} style={styles.staffAvatar}>
                <Ionicons name="person" size={18} color="#0284C7" />
              </View>
            ))} */}
          </ScrollView>
        )}
      </View>

      <View style={styles.rightSide}>
        <View
          style={[
            styles.badge,
            (branch.status || "active").toLowerCase() === "active"
              ? styles.badgeActive
              : styles.badgeDisabled,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              (branch.status || "active").toLowerCase() ===
                "disabled" && { color: "#7F1D1D" },
            ]}
          >
            {(branch.status || "active").toUpperCase()}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color="#94A3B8"
        />
      </View>
    </TouchableOpacity>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function BranchesTab() {
  const router = useRouter();
  const { institutionId } =
    useLocalSearchParams<{ institutionId: string }>();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "disabled">("all");
  const [showFilter, setShowFilter] = useState(false);

  const {
    data: branches = [],
    isLoading: branchesLoading,
    error,
  } = useInstitutionBranches(institutionId);

  /* ================= FILTER LOGIC ================= */
  const filteredBranches = useMemo(() => {
    return branches.filter((branch: Branch) => {
      const branchStatus = (branch.status || "active").toLowerCase();

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && branchStatus === "active") ||
        (filter === "disabled" && branchStatus === "disabled");

      const matchesSearch = branch.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [branches, filter, search]);

  if (branchesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={{ marginTop: 12 }}>Loading branches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Failed to load branches</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
    >
      {/* HEADER */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Branches</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push(
              `/dashboard/ownerDashboard/institution/${institutionId}/branches/create`
            )
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SEARCH + FILTER */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search branches..."
            placeholderTextColor="#94A3B8"
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

        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Ionicons name="filter" size={16} color="#0284C7" />
            <Text style={styles.filterLabel}>
              {filter.toUpperCase()}
            </Text>
            <Ionicons
              name={showFilter ? "chevron-up" : "chevron-down"}
              size={14}
              color="#64748B"
            />
          </TouchableOpacity>

          {showFilter && (
            <View style={styles.dropdown}>
              {["all", "active", "disabled"].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilter(f as any);
                    setShowFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      filter === f && {
                        fontWeight: "800",
                        color: "#0284C7",
                      },
                    ]}
                  >
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* BRANCH LIST */}
      {filteredBranches.length > 0 ? (
        filteredBranches.map((branch: Branch) => (
          <BranchCard
            key={branch._id}
            branch={branch}
            institutionId={institutionId!}
            router={router}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="business-outline"
            size={48}
            color="#CBD5E1"
          />
          <Text style={styles.emptyTitle}>
            No branches found
          </Text>
          <Text style={styles.emptySub}>
            {search || filter !== "all"
              ? "Try adjusting your search or filter"
              : "You haven't created any branches yet"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  title: { fontSize: 20, fontWeight: "800" },

  addBtn: {
    backgroundColor: "#0284C7",
    padding: 10,
    borderRadius: 10,
  },

  searchFilterRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
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
    width: 120,
    elevation: 4,
    zIndex: 20,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dropdownText: { fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  branchName: {
    fontSize: 15,
    fontWeight: "700",
  },

  branchMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  staffAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  rightSide: {
    alignItems: "flex-end",
    gap: 6,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeActive: { backgroundColor: "#DCFCE7" },
  badgeDisabled: { backgroundColor: "#FEE2E2" },

  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
  },

  emptyState: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
  },

  emptySub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
});
