import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useMemo, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNav from "../../../../../components/BottomNav";
import ResponseModal from "../../../../../components/ResponseModal";
import { useInstitutions } from "@/hooks/useInstitutions";

export default function InstitutionsList() {
  const router = useRouter();

  const {
    data: institutions = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useInstitutions();

  const [filter, setFilter] =
    useState<"all" | "active" | "disabled">("all");
  const [search, setSearch] = useState("");

  /* ===============================
     ✅ REFRESH WHEN SCREEN FOCUSED
  ================================ */
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  /* ===============================
     FILTER LOGIC
  ================================ */
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst: any) => {
      const matchesFilter =
        filter === "all" || inst.status === filter;

      const matchesSearch = inst.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, search, institutions]);

  /* ===============================
     ERROR STATE
  ================================ */
  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#EF4444" }}>
          Failed to load institutions
        </Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={{ color: "#0284C7", marginTop: 10 }}>
            Tap to Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ===============================
     LIST ITEM
  ================================ */
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname:
            "/dashboard/superAdminDashboard/institution/[institutionId]/Index",
          params: { institutionId: item.id },
        })
      }
    >
      <View style={styles.cardLeft}>
        <Image
          source={{
            uri:
              item.logo ||
              `https://ui-avatars.com/api/?name=${item.name}`,
          }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.instName}>
            {item.name}
          </Text>
          <Text style={styles.instMeta}>
            {item.adminCount} Admin • {item.staffCount} Staff
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Institutions
          </Text>
          <Text style={styles.subtitle}>
            Manage institutions
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push(
              "/dashboard/superAdminDashboard/institution/institutionCreation/CreationStepOne"
            )
          }
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search"
          size={16}
          color="#64748B"
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search institutions..."
          style={styles.searchInput}
        />
      </View>

      {/* FILTERS */}
      <View style={styles.filterWrapper}>
        {["all", "active", "disabled"].map(
          (f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                filter === f &&
                  styles.filterBtnActive,
              ]}
              onPress={() =>
                setFilter(f as any)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && {
                    color: "#fff",
                    fontWeight: "700",
                  },
                ]}
              >
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* LIST */}
      {isLoading ? (
        <View style={styles.center}>
          <Text>Loading institutions...</Text>
        </View>
      ) : filteredInstitutions.length === 0 ? (
        <View style={styles.center}>
          <Text>No institutions found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredInstitutions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        />
      )}

      <BottomNav dashboardType="superAdmin" />
    </View>
  );
}


/* ===============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    marginTop: 60,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  addBtn: {
    backgroundColor: "#0284C7",
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 46,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
  },

  filterWrapper: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
  },

  filterBtnActive: {
    backgroundColor: "#0284C7",
  },

  filterText: {
    fontSize: 12,
    color: "#64748B",
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

  cardLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  instName: {
    fontWeight: "700",
  },

  instMeta: {
    fontSize: 12,
    color: "#64748B",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  skeletonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
  },

  skeletonLineShort: {
    width: 80,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    marginBottom: 6,
  },

  skeletonLineLong: {
    width: "60%",
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
});

