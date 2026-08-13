import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/authService";


export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getProfile();
      return res.data.data;
    },
    staleTime: 0, // always consider stale
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

