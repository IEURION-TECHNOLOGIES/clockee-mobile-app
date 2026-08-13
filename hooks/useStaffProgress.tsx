// hooks/useStaffProgress.ts

import { useQuery } from "@tanstack/react-query";
import {
  getStaffProgress,
  StaffProgressData,
} from "@/services/clockServices";

export function useStaffProgress() {
  return useQuery<StaffProgressData, Error>({
    queryKey: ["staff-progress"],

    queryFn: async () => {
      const response =
        await getStaffProgress();

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to load staff progress"
        );
      }

      if (!response.data?.data) {
        throw new Error(
          "Staff progress data is missing"
        );
      }

      return response.data.data;
    },

    staleTime: 0,

    gcTime: 1000 * 60 * 10,

    retry: 1,

    refetchOnMount: "always",

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,

    // Updates the UI after clock-in/clock-out
    refetchInterval: 15000,
  });
}
