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
  RefreshControl,
} from "react-native";

import { useInstitutionBranches } from "@/hooks/useInstitutionBranches";

type Branch = {
  _id: string;
  name: string;
  status: "active" | "disabled";
  staffCount?: number;
  adminCount?: number;
};

export default function BranchesTab() {
  const router = useRouter();
  const { institutionId } =
    useLocalSearchParams<{ institutionId: string }>();

  const [search, setSearch] = useState("");

  const {
    data: branches = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useInstitutionBranches(institutionId ?? null);

  console.log("📊 Screen received branches:", branches);
  console.log("📊 isLoading:", isLoading);
  console.log("📊 isFetching:", isFetching);
  console.log("📊 error:", error);

  const filteredBranches = useMemo(() => {
    if (!Array.isArray(branches)) return [];

    return branches.filter((branch: Branch) =>
      branch?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [branches, search]);

  if (!institutionId) {
    return (
      <View style={styles.loader}>
        <Text>No Institution ID provided</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading branches...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={refetch}
        />
      }
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>Branches</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push(
              `/dashboard/superAdminDashboard/institution/${institutionId}/branches/create`
            )
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search branches..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      {filteredBranches.length > 0 ? (
        filteredBranches.map((item: Branch) => (
          <TouchableOpacity
            key={item._id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname:
                  "/dashboard/superAdminDashboard/institution/[institutionId]/branches/[branchId]",
                params: {
                  institutionId,
                  branchId: item._id,
                  branchName: item.name,
                  branchStatus: item.status,
                  staffCount: item.staffCount?.toString(),
                  adminCount: item.adminCount?.toString(),
                },
              })
            }
                      >
            <View>
              <Text style={styles.branchName}>{item.name}</Text>

              {item.adminCount !== undefined && (
                <Text style={styles.branchMeta}>
                  {item.adminCount} Admin
                </Text>
              )}

              {item.staffCount !== undefined && (
                <Text style={styles.branchMeta}>
                  {item.staffCount} Staff
                </Text>
              )}
            </View>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#94A3B8"
            />
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
        </View>
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

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

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 46,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
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
    elevation: 2,
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

  emptyState: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
  },
});
