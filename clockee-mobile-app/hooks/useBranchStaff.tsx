import { useQuery } from "@tanstack/react-query";
import { getStaffByBranch } from "@/services/superAdminServices";

export const useBranchStaff = (branchId: string) => {
  return useQuery({
    queryKey: ["branchStaff", branchId],
    queryFn: async () => {
      const res = await getStaffByBranch(branchId);
      return res?.data?.data || [];
    },
    enabled: !!branchId,
    staleTime: 1000 * 60 * 3,
  });
};
