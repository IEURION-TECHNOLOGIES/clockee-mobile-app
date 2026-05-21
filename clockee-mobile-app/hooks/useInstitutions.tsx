// hooks/useInstitutions.ts
import { useQuery } from "@tanstack/react-query";
import {
  getInstitutions,
  getStaffByInstitution,
  getAdminByInstitution,
} from "@/services/superAdminServices";

export const useInstitutions = () => {
  return useQuery({
    queryKey: ["institutions"],

    queryFn: async () => {
      const res = await getInstitutions();
      const institutions = res?.data?.institutions || [];

      const formatted = await Promise.all(
        institutions.map(async (item: any) => {
          let staffCount = 0;
          let adminCount = 0;

          try {
            const staffRes = await getStaffByInstitution(item._id);
            staffCount = staffRes?.data?.data?.length || 0;
          } catch {}

          try {
            const adminRes = await getAdminByInstitution(item._id);
            adminCount = adminRes?.data?.data?.length || 0;
          } catch {}

          return {
            id: item._id,
            name: item.name,
            status: item.isActive ? "active" : "disabled",
            createdAt: item.createdAt,
            logo: item.logo || null,
            staffCount,
            adminCount,
            branches: item.branches || 0,
          };
        })
      );

      return formatted;
    },

    // ✅ Good balanced settings
    staleTime: 1000 * 30, // 30 seconds
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  
};
