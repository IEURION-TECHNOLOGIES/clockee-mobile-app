import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignStaffToBranch } from "@/services/superAdminServices";

export const useAssignStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      institutionId,
      userId,
      branchId,
    }: {
      institutionId: string;
      userId: string;
      branchId: string;
    }) =>
      assignStaffToBranch(institutionId, userId, branchId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchStaff"] });
    },
  });
};
