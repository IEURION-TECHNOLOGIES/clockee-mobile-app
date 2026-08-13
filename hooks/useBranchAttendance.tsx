// hooks/useBranchAttendance.ts

import {
  useQuery,
} from "@tanstack/react-query";

import {
  AttendanceFilters,
  getBranchAttendanceLogs,
} from "@/services/superAdminServices";

export function useBranchAttendance(
  branchId?: string | null,
  filters: AttendanceFilters = {}
) {
  return useQuery({
    queryKey: [
      "branchAttendanceLogs",
      branchId,
      filters,
    ],

    queryFn: async () => {
      if (!branchId) {
        throw new Error(
          "Branch ID is required."
        );
      }

      const response =
        await getBranchAttendanceLogs(
          branchId,
          filters
        );

      return response.data;
    },

    enabled: Boolean(branchId),

    staleTime: 1000 * 60 * 2,

    gcTime: 1000 * 60 * 10,

    refetchOnMount: true,

    refetchOnWindowFocus: false,
  });
}
