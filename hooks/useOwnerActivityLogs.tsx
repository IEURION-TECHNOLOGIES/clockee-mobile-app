import {
  useQuery,
} from "@tanstack/react-query";

import {
  getOwnerActivityLogs,
  MonthName,
  ActivityLogsResponse,
} from "@/services/superAdminServices";

type UseOwnerActivityLogsParams = {
  institutionId?: string | null;
  month: MonthName;
  year: number;
};

const DEBUG_ACTIVITY_LOGS = __DEV__;

function logActivity(
  message: string,
  data?: unknown
) {
  if (!DEBUG_ACTIVITY_LOGS) {
    return;
  }

  const time =
    new Date().toLocaleTimeString();

  if (data !== undefined) {
    console.log(
      `[ActivityLogs ${time}] ${message}`,
      data
    );
  } else {
    console.log(
      `[ActivityLogs ${time}] ${message}`
    );
  }
}

function logActivityJson(
  message: string,
  data: unknown
) {
  if (!DEBUG_ACTIVITY_LOGS) {
    return;
  }

  const time =
    new Date().toLocaleTimeString();

  try {
    console.log(
      `[ActivityLogs ${time}] ${message}\n${JSON.stringify(
        data,
        null,
        2
      )}`
    );
  } catch (error) {
    console.log(
      `[ActivityLogs ${time}] Could not stringify data`,
      error
    );
  }
}

export function useOwnerActivityLogs({
  institutionId,
  month,
  year,
}: UseOwnerActivityLogsParams) {
  const query = useQuery<
    ActivityLogsResponse,
    Error
  >({
    queryKey: [
      "owner-activity-logs",
      institutionId,
      month,
      year,
    ],

    queryFn: async () => {
      logActivity("Query started", {
        institutionId,
        month,
        year,
      });

      if (!institutionId) {
        logActivity(
          "Query blocked because institutionId is missing"
        );

        throw new Error(
          "Institution ID is required"
        );
      }

      try {
        logActivity(
          "Calling one activity logs endpoint",
          {
            method: "GET",
            endpoint: `/admin/owner/${institutionId}/activity-logs`,
            params: {
              month,
              year,
            },
          }
        );

        const response =
          await getOwnerActivityLogs(
            institutionId,
            month,
            year
          );

        logActivity("HTTP request completed", {
          status: response.status,
          statusText: response.statusText,
          url: response.config?.url,
          params: response.config?.params,
        });

        logActivityJson(
          "FULL BACKEND RESPONSE",
          response.data
        );

        const payload = response.data;

        if (!payload) {
          logActivity(
            "Backend returned an empty response"
          );

          throw new Error(
            "Activity logs response is empty"
          );
        }

        if (payload.success === false) {
          logActivity(
            "Backend returned success: false",
            payload
          );

          throw new Error(
            "Backend failed to retrieve activity logs"
          );
        }

        const data = payload.data;

        if (!data) {
          logActivity(
            "Backend response does not contain data"
          );

          throw new Error(
            "Activity logs data is missing"
          );
        }

        logActivity("Parsed activity log counts", {
          attendance:
            data.attendance?.length || 0,

          branchLogs:
            data.branchLogs?.length || 0,

          billingLogs:
            data.billingLogs?.length || 0,

          staffLogs:
            data.staffLogs?.length || 0,
        });

        logActivityJson(
          "ATTENDANCE DATA",
          data.attendance || []
        );

        logActivityJson(
          "BRANCH LOGS",
          data.branchLogs || []
        );

        logActivityJson(
          "BILLING LOGS",
          data.billingLogs || []
        );

        logActivityJson(
          "STAFF LOGS",
          data.staffLogs || []
        );

        logActivity(
          "Activity logs loaded successfully"
        );

        return payload;
      } catch (error: any) {
        logActivity(
          "Activity logs request failed",
          {
            message: error?.message,
            status: error?.response?.status,
            statusText:
              error?.response?.statusText,
            responseData:
              error?.response?.data,
            requestUrl: error?.config?.url,
            requestParams:
              error?.config?.params,
          }
        );

        if (error?.response?.data) {
          logActivityJson(
            "BACKEND ERROR BODY",
            error.response.data
          );
        }

        throw error;
      }
    },

    enabled: Boolean(institutionId),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: (failureCount, error) => {
      logActivity("Retry decision", {
        failureCount,
        error: error.message,
      });

      return failureCount < 1;
    },
  });

  if (DEBUG_ACTIVITY_LOGS) {
    console.log(
      "[ActivityLogs] Query state",
      {
        institutionId,
        month,
        year,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isPending: query.isPending,
        isSuccess: query.isSuccess,
        isError: query.isError,
        fetchStatus: query.fetchStatus,
        error: query.error?.message,
        dataAvailable: Boolean(query.data),
      }
    );
  }

  return query;
}
