// hooks/useSummary.ts
import { getDashboardSummary } from "@/services/institutionService";
import { useQuery } from "@tanstack/react-query";

export const useSummary = () => {
  return useQuery({
    queryKey: ["dashboardSummary"],

    queryFn: async () => {
      try {
        console.log("🚀 FETCHING DASHBOARD SUMMARY...");

        const res = await getDashboardSummary();

        console.log("✅ SUMMARY RESPONSE:", res?.data);

        return res?.data?.data || res?.data || {};
      } catch (error: any) {
        console.log(
          "❌ SUMMARY ERROR:",
          error?.response?.data || error
        );
        return {};
      }
    },

    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
