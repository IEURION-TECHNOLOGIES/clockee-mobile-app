import { useQuery } from "@tanstack/react-query";
import {
  getSchedule,
  getClockHistory,
  getClockSummary,
} from "@/services/clockServices";

export const useStaffData = () => {
  return useQuery({
    queryKey: ["staff-data"],

    queryFn: async () => {
      const [scheduleRes, summaryRes, historyRes] =
        await Promise.all([
          getSchedule(),
          getClockSummary(),
          getClockHistory(),
        ]);

      return {
        schedule: scheduleRes?.data?.data ?? null,
        summary: summaryRes?.data?.data ?? null,
        history: historyRes?.data?.data ?? [],
      };
    },

    // 🔥 SPEED CONFIG
    staleTime: 1000 * 60 * 15, // 15 mins (no refetch)
    gcTime: 1000 * 60 * 60,    // 1 hour in memory

    retry: 0,

    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};


