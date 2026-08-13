// hooks/useDashboardOverview.ts

import { useQuery } from "@tanstack/react-query";
import api from "@/api/baseUrl";
import { DashboardOverviewResponse, OverviewRange } from "@/types/dashboard";

export function useDashboardOverview(range: OverviewRange) {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ["dashboard-overview", range],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/dashboard/overview`, {
        params: { range },
      });
      // Adjust based on your API response structure (e.g. data.data if wrapped)
      return data.data ?? data;
    },
    staleTime: 60_000,
  });
}
