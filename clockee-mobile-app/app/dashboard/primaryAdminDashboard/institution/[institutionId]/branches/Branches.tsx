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
} from "react-native";

type Branch = {
  id: string;
  name: string;
  status: "active" | "disabled";
  staff: number;
  admin: number;
};

export default function BranchesTab() {
  const router = useRouter();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();

  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"all" | "active" | "disabled">("all");
  const [showFilter, setShowFilter] = useState(false);

  /* ================= DATA ================= */
  const [branches] = useState<Branch[]>([
    { id: "1", name: "Main Campus", status: "active", staff: 120, admin: 3 },
    { id: "2", name: "North Wing", status: "disabled", staff: 40, admin: 2 },
    { id: "3", name: "City Branch", status: "active", staff: 85, admin: 1 },
    { id: "4", name: "West End", status: "active", staff: 60, admin: 1 },
    { id: "5", name: "South Block", status: "disabled", staff: 25, admin: 1 },
  ]);

  /* ================= FILTER LOGIC ================= */
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const matchesFilter =
        filter === "all" || branch.status === filter;

      const matchesSearch = branch.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [branches, filter, search]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 20,
        paddingBottom: 100,
      }}
    >
      {/* ================= HEADER ================= */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Branches</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push(
              `/dashboard/primaryAdminDashboard/institution/${institutionId}/branches/create`
            )
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
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

        {/* FILTER */}
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

      {/* ================= LIST ================= */}
      {filteredBranches.length > 0 ? (
        filteredBranches.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname:
                  "/dashboard/primaryAdminDashboard/institution/[institutionId]/branches/[branchId]",
                params: {
                  institutionId,
                  branchId: item.id,
                },
              })
            }
          >
            <View>
              <Text style={styles.branchName}>{item.name}</Text>
              <Text style={styles.branchMeta}>
                {item.admin} Admin
              </Text>
              <Text style={styles.branchMeta}>
                {item.staff} Staff Members
              </Text>
            </View>

            <View style={styles.rightSide}>
              <View
                style={[
                  styles.badge,
                  item.status === "active"
                    ? styles.badgeActive
                    : styles.badgeDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status === "disabled" && {
                      color: "#7F1D1D",
                    },
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={16}
                color="#94A3B8"
              />
            </View>
          </TouchableOpacity>
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
            Try adjusting your search or filter
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
  },

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

  searchInput: {
    flex: 1,
    marginLeft: 8,
  },

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

  dropdownText: {
    fontSize: 12,
  },

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
    fontSize: 14,
    fontWeight: "700",
  },

  branchMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
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

  badgeActive: {
    backgroundColor: "#DCFCE7",
  },

  badgeDisabled: {
    backgroundColor: "#FEE2E2",
  },

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
  },
});