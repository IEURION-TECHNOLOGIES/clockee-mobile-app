import { useQuery } from "@tanstack/react-query";

import {
  getOwnerSubscriptionHistory,
  SubscriptionHistoryItem,
} from "@/services/superAdminServices";

type SubscriptionHistoryData = {
  institution: {
    id: string;
    name: string;
  } | null;

  subscriptions: SubscriptionHistoryItem[];
};

export function useOwnerSubscriptionHistory() {
  return useQuery<
    SubscriptionHistoryData,
    Error
  >({
    queryKey: [
      "owner-subscription-history",
    ],

    queryFn: async () => {
      console.log(
        "[SubscriptionHistory] Fetching subscription history"
      );

      const response =
        await getOwnerSubscriptionHistory();

      console.log(
        "[SubscriptionHistory] Response:",
        response.data
      );

      const payload = response.data;

      if (!payload?.success) {
        throw new Error(
          "Failed to load subscription history"
        );
      }

      const data = payload.data;

      console.log(
        "[SubscriptionHistory] Institution:",
        data?.institution
      );

      console.log(
        "[SubscriptionHistory] Total subscriptions:",
        data?.subscriptions?.length || 0
      );

      return {
        institution:
          data?.institution || null,

        subscriptions:
          data?.subscriptions || [],
      };
    },

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,

    refetchOnWindowFocus: true,
  });
}



