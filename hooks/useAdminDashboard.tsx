import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  BranchAdminDashboardData,
  getBranchAdminDashboardOverview,
} from "@/services/superAdminServices";

export function useBranchOverview(
  branchId?: string | null
) {
  console.log(
    "[BranchOverview] HOOK CALLED:",
    {
      branchId,
      hasBranchId: Boolean(branchId),
    }
  );

  const query = useQuery<
    BranchAdminDashboardData,
    Error
  >({
    queryKey: [
      "branch-admin-overview",
      branchId,
    ],

    queryFn: async () => {
      console.log(
        "[BranchOverview] QUERY STARTED:",
        { branchId }
      );

      if (!branchId) {
        throw new Error(
          "Branch ID is required"
        );
      }

      console.log(
        "[BranchOverview] CALLING API:",
        {
          branchId,
          endpoint: `/admin/branch/${branchId}/dashboard/overview`,
        }
      );

      const response =
        await getBranchAdminDashboardOverview(
          branchId
        );

      console.log(
        "[BranchOverview] API RESPONSE:",
        {
          status: response.status,
          success: response.data?.success,
          responseBranchId:
            response.data?.data?.branch?._id,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          "Unable to load branch overview"
        );
      }

      return response.data.data;
    },

    enabled: Boolean(branchId),

    staleTime: 1000 * 60 * 2,

    gcTime: 1000 * 60 * 10,

    retry: 1,

    refetchOnWindowFocus: true,

    refetchOnMount: "always",
  });

  useEffect(() => {
    console.log(
      "[BranchOverview] QUERY STATE:",
      {
        branchId,
        status: query.status,
        fetchStatus: query.fetchStatus,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isSuccess: query.isSuccess,
        isError: query.isError,
        hasData: Boolean(query.data),
        errorMessage: query.error?.message,
      }
    );
  }, [
    branchId,
    query.status,
    query.fetchStatus,
    query.isLoading,
    query.isFetching,
    query.isSuccess,
    query.isError,
    query.data,
    query.error,
  ]);

  return query;
}
