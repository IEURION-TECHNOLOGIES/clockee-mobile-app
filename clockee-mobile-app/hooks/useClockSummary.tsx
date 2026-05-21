import { useQuery } from "@tanstack/react-query";
import { getClockSummary } from "@/services/clockServices";

export const useClockSummary = () => {
  return useQuery({
    queryKey: ["clock-summary"],
    queryFn: async () => {
      const res = await getClockSummary();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
};