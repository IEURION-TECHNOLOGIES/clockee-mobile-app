// hooks/useInstitutionStaff.ts
import { useQuery } from "@tanstack/react-query";
import { getStaffByInstitution } from "@/services/superAdminServices";

export const useInstitutionStaff = (institutionId: string | null) => {
  return useQuery({
    queryKey: ["institutionStaff", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const res = await getStaffByInstitution(institutionId);
      console.log("📋 Fetched staff for institution", institutionId, res?.data);
      return res?.data?.data || [];
    },
    enabled: !!institutionId,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: false,
  });
};

