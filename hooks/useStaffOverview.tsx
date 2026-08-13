// hooks/useStaffOverview.ts

import { useQuery } from "@tanstack/react-query";

import {
  getStaffOverview,
} from "@/services/clockServices";

/* ================= TYPES ================= */

export type StaffOverviewStaff = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  employeeNumber: string | null;
  department: string | null;
  jobTitle: string | null;
  roles: string[];
  accountStatus: string;
  employmentStatus: string | null;
  joinedAt: string | null;
  branch: {
    id: string;
    name: string;
    code: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    timezone: string;
    status: string;
  } | null;
};

export type StaffOverviewDateRange = {
  from: string;
  to: string;
  timezone: string;
  weekStartsOn: string;
};

export type StaffOverviewSchedule = {
  id: string | null;
  name: string;
  timezone: string;
  workDays: string[];
  expectedStartTime: string;
  expectedEndTime: string;
  breakDurationMinutes: number;
  expectedDailyHours: number;
  expectedWeeklyHours: number;
  gracePeriodMinutes: number;
  overtimeEnabled: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
};

export type StaffOverviewToday = {
  date: string;
  isScheduledWorkDay: boolean;
  status: string;
  clockedIn: boolean;
  clockedOut: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  workedMinutes: number;
  workedHours: number;
  isLate: boolean;
  lateMinutes: number;
  isOvertime: boolean;
  overtimeMinutes: number;
  attendanceRecordId: string | null;
  scheduledEndTime: string | null;
  scheduledStartTime: string | null;
};

export type StaffOverviewSummary = {
  period: string;
  scheduledDays: number;
  workedDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  remoteDays: number;
  leaveDays: number;
  partialDays: number;
  incompleteDays: number;
  totalWorkedMinutes: number;
  totalWorkedHours: number;
  expectedMinutes: number;
  expectedHours: number;
  remainingMinutes: number;
  remainingHours: number;
  overtimeMinutes: number;
  overtimeHours: number;
  attendanceRate: number;
  punctualityRate: number;
  completionRate: number;
};

export type StaffOverviewWeeklyTrendItem = {
  date: string;
  day: string;
  scheduled: boolean;
  status: string;
  workedMinutes: number;
  workedHours: number;
  expectedMinutes: number;
  overtimeMinutes: number;
};

export type StaffOverviewAttendanceRecord = {
  id: string;
  date: string;
  status: string;
  scheduled: boolean;
  expectedStartTime: string;
  expectedEndTime: string;
  clockIn: {
    time: string;
    source: string;
    mode: string;
    location: {
      longitude: number;
      latitude: number;
    } | null;
    withinBranchRadius: boolean;
  } | null;
  clockOut: {
    time: string;
    source: string;
    mode: string;
    location: {
      longitude: number;
      latitude: number;
    } | null;
    withinBranchRadius: boolean;
  } | null;
  break: {
    totalMinutes: number;
    segments: unknown[];
  };
  workedMinutes: number;
  workedHours: number;
  expectedMinutes: number;
  overtimeMinutes: number;
  isLate: boolean;
  lateMinutes: number;
  isIncomplete: boolean;
  notes: string | null;
  approved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffOverviewLeaveSummary = {
  annualAllowanceDays: number;
  usedDays: number;
  remainingDays: number;
  pendingRequests: number;
};

export type StaffOverviewNotifications = {
  unreadCount: number;
  items: unknown[];
};

export type StaffOverviewMeta = {
  generatedAt: string;
  requestId: string | null;
  version: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export type StaffOverviewData = {
  staff: StaffOverviewStaff;
  dateRange: StaffOverviewDateRange;
  schedule: StaffOverviewSchedule;
  today: StaffOverviewToday;
  summary: StaffOverviewSummary;
  weeklyTrend: StaffOverviewWeeklyTrendItem[];
  attendanceRecords: StaffOverviewAttendanceRecord[];
  leaveSummary: StaffOverviewLeaveSummary;
  notifications: StaffOverviewNotifications;
  meta?: StaffOverviewMeta;
};

export type StaffOverviewResponse = {
  success: boolean;
  data: StaffOverviewData;
};

/* ================= HOOK ================= */

export const useStaffOverview = () => {
  return useQuery<
    StaffOverviewData,
    Error
  >({
    queryKey: [
      "staff-overview",
    ],

    queryFn: async () => {
      console.log(
        "[StaffOverview] Fetching one-route overview"
      );

      const response =
        await getStaffOverview();

      console.log(
        "[StaffOverview] API response:",
        {
          status: response.status,
          success:
            response.data?.success,
          staffId:
            response.data?.data?.staff?.id,
          staffName:
            response.data?.data?.staff?.name,
          todayStatus:
            response.data?.data?.today?.status,
          attendanceRecords:
            response.data?.data
              ?.attendanceRecords?.length || 0,
          weeklyTrend:
            response.data?.data
              ?.weeklyTrend?.length || 0,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          "Unable to load staff overview"
        );
      }

      if (!response.data?.data) {
        throw new Error(
          "Staff overview data is missing"
        );
      }

      return response.data.data;
    },

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 20,

    retry: 1,

    refetchOnMount: true,

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,
  });
};

