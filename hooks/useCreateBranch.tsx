import { useState } from "react";
import { createBranch } from "@/services/superAdminServices";
import { useQueryClient } from "@tanstack/react-query";

interface CreateBranchPayload {
  institutionId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const useCreateBranch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const handleCreateBranch = async (
    payload: CreateBranchPayload
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await createBranch(payload);

      // 🔥 THIS IS THE IMPORTANT PART
      await queryClient.invalidateQueries({
        queryKey: ["institutionBranches", payload.institutionId],
      });

      setSuccess(true);
      return response.data;
    } catch (err: any) {
      console.log(
        "❌ Create Branch Error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to create branch"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleCreateBranch,
    loading,
    error,
    success,
  };
};
