import { useQuery } from "@tanstack/react-query";
import {
  getSchedule,
  getClockHistory,
  getClockSummary,
} from "@/services/clockServices";

export const useStaffOverview = () => {
  return useQuery({
    queryKey: ["staff-overview"],

    queryFn: async () => {
      const schedulePromise = getSchedule();
      const summaryPromise = getClockSummary();
      const historyPromise = getClockHistory();

      const [scheduleRes, summaryRes, historyRes] =
        await Promise.all([
          schedulePromise,
          summaryPromise,
          historyPromise,
        ]);

      return {
        schedule: scheduleRes?.data?.data ?? null,
        summaryData: summaryRes?.data?.data ?? null,
        history: historyRes?.data?.data ?? [],
      };
    },

    // 🔥 SPEED SETTINGS
    staleTime: 1000 * 60 * 10,   // 10 mins (avoid frequent refetch)
    gcTime: 1000 * 60 * 30,      // keep in memory longer
    retry: 0,                    // no retry = faster failure
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
