import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBranch } from "@/services/superAdminServices";

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      branchId,
      payload,
    }: {
      branchId: string;
      payload: any;
    }) => {
      const res = await updateBranch(branchId, payload);
      return res?.data;
    },

    onSuccess: () => {
      // Refresh branches after update
      queryClient.invalidateQueries({
        queryKey: ["institutionBranches"],
      });
    },
  });
};
