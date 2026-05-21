import { getInstitutionBranches } from "@/services/superAdminServices";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export const useInstitutionBranches = (
  institutionId: string | null
) => {
  console.log("🏢 useInstitutionBranches");
  console.log("📌 institutionId:", institutionId);

  const query = useQuery({
    queryKey: ["institutionBranches", institutionId],

    queryFn: async () => {
      try {
        console.log("🚀 FETCHING BRANCHES...");

        if (!institutionId) {
          console.log("❌ No institutionId");
          return [];
        }

        const res = await getInstitutionBranches(
          institutionId
        );

        console.log("✅ RAW RESPONSE:", res?.data);

        const branches =
          res?.data?.data ||
          res?.data?.branches ||
          res?.data ||
          [];

        console.log("🌿 PARSED BRANCHES:", branches);

        return Array.isArray(branches)
          ? branches
          : [];
      } catch (error: any) {
        console.log(
          "❌ BRANCH FETCH ERROR:",
          error?.response?.data || error
        );

        return [];
      }
    },

    enabled: !!institutionId,

    // ✅ FIXED SETTINGS
    staleTime: 1000 * 60 * 5,

    refetchOnMount: false,

    refetchOnWindowFocus: false,

    retry: false,
  });

  // ✅ ONLY REFETCH ON REAL SCREEN FOCUS
  useFocusEffect(
    useCallback(() => {
      if (!institutionId) return;

      console.log("🔄 SCREEN FOCUSED -> REFETCH");

      query.refetch();
    }, [institutionId])
  );

  console.log("⏳ branchesLoading:", query.isLoading);
  console.log("🔄 branchesFetching:", query.isFetching);
  console.log("❌ branchesError:", query.error);
  console.log("🌿 branchesData:", query.data);

  return query;
};
