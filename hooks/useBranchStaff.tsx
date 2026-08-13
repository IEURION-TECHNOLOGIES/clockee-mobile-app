import { useQuery } from "@tanstack/react-query";
import { getStaffByBranch } from "@/services/superAdminServices";

export const useBranchStaff = (
  branchId?: string
) => {
  const cleanBranchId =
    typeof branchId === "string"
      ? branchId.trim()
      : undefined;

  return useQuery({
    queryKey: ["branchStaff", cleanBranchId],

    enabled: Boolean(cleanBranchId),

    queryFn: async () => {
      if (!cleanBranchId) {
        console.warn(
          "[useBranchStaff] Missing branch ID"
        );

        return [];
      }

      console.log(
        "[useBranchStaff] Fetching staff for branch:",
        cleanBranchId
      );

      try {
        const res = await getStaffByBranch(
          cleanBranchId
        );

        console.log(
          "[useBranchStaff] Complete response:",
          res
        );

        const staff =
          res?.data?.data ||
          res?.data?.staff ||
          res?.data ||
          [];

        console.log(
          "[useBranchStaff] Extracted staff:",
          staff
        );

        console.log(
          "[useBranchStaff] Staff count:",
          Array.isArray(staff)
            ? staff.length
            : 0
        );

        return Array.isArray(staff)
          ? staff
          : [];
      } catch (error: any) {
        console.error(
          "[useBranchStaff] Branch ID used:",
          cleanBranchId
        );

        console.error(
          "[useBranchStaff] Error response:",
          error?.response?.data
        );

        console.error(
          "[useBranchStaff] Error status:",
          error?.response?.status
        );

        throw error;
      }
    },

    staleTime: 1000 * 60 * 3,

    retry: false,
  });
};
