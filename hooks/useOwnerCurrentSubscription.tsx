import { useQuery } from "@tanstack/react-query";

import {
  getOwnerCurrentSubscription,
  OwnerSubscription,
} from "@/services/superAdminServices";


function normalizeSubscriptionResponse(
  responseData: any
): OwnerSubscription | null {
  if (!responseData) {
    return null;
  }

  /*
   * Supports both backend response formats:
   *
   * Direct object:
   * {
   *   activePlan: null,
   *   status: "trialing"
   * }
   *
   * Wrapped object:
   * {
   *   success: true,
   *   data: {
   *     activePlan: null,
   *     status: "trialing"
   *   }
   * }
   */
  const subscription =
    responseData?.data &&
    typeof responseData.data === "object" &&
    !Array.isArray(responseData.data)
      ? responseData.data
      : responseData;

  return {
    activePlan:
      subscription.activePlan ?? null,

    planName:
      subscription.planName ?? null,

    billingCycle:
      subscription.billingCycle ?? null,

    status:
      subscription.status || "inactive",

    amount:
      Number(subscription.amount || 0),

    currency:
      subscription.currency || "NGN",

    startedAt:
      subscription.startedAt ?? null,

    currentPeriodEnd:
      subscription.currentPeriodEnd ?? null,

    cancelAtPeriodEnd:
      Boolean(
        subscription.cancelAtPeriodEnd
      ),

    trialEndsAt:
      subscription.trialEndsAt ?? null,
  };
}

export function useOwnerCurrentSubscription() {
  return useQuery<
    OwnerSubscription | null,
    Error
  >({
    queryKey: [
      "owner-current-subscription",
    ],

    queryFn: async () => {
      const response =
        await getOwnerCurrentSubscription();

      return normalizeSubscriptionResponse(
        response.data
      );
    },

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,

    refetchOnWindowFocus: true,
  });
}

