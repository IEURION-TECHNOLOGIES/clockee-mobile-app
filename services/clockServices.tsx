// services/clockService.ts
import API from "@/api/baseUrl";
import { getToken } from "../utils/token";

export const clockIn = async (lat: number, lng: number) => {
  const token = await getToken();

  return API.post("/clock/clock", {
    actionType: "clock-in",
    mode: "silent",
    gps: {
      lat: Number(lat.toFixed(3)),   // 3 decimal places
      lng: Number(lng.toFixed(3)),
    },
    token,
  });
};


export const clockOut = async (lat: number, lng: number) => {
  const token = await getToken();

  return API.post("/clock/clock", {
    actionType: "clock-out",
    mode: "silent",
    gps: {
      lat: Number(lat.toFixed(3)),   // 3 decimal places
      lng: Number(lng.toFixed(3)),
    },
    token,
  });
};


export const getClockHistory = async () => {
  return API.get("/clock/history");
};

export const getCurrentClockStatus = async () => {
  return API.get("/clock/status");
}

export const getClockSummary = async () => {
  return API.get("/clock/staff/summary");
}

export const getSchedule = async () => {
  return API.get("/clock/shedule");
}


export const syncOfflineLogs = (data: any) =>
  API.post("/clock/sync", data);


export const getStaffOverview = () => {
  return API.get(
    "/admin/me/overview"
  );
};



/* ================= STAFF PROGRESS TYPES ================= */

export type StaffProgressStatus =
  | "present"
  | "absent"
  | "late"
  | "remote"
  | "onLeave"
  | "off"
  | "upcoming"
  | string;

export type StaffProgressStaff = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  employeeNumber: string | null;
  department: string | null;
  jobTitle: string | null;
  role: string[];
  accountStatus: string;
};

export type StaffProgressBranch = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  timezone: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  attendanceRadiusMeters: number;
  locationVerificationRequired: boolean;
};

export type StaffProgressDate = {
  value: string;
  day: string;
  timezone: string;
  isToday: boolean;
  isScheduledWorkDay: boolean;
};

export type StaffProgressSchedule = {
  id: string | null;
  name: string;
  timezone: string;
  workDays: string[];
  expectedStartTime: string;
  expectedEndTime: string;
  expectedDurationMinutes: number;
  expectedWorkMinutes: number;
  breakDurationMinutes: number;
  gracePeriodMinutes: number;
  overtimeEnabled: boolean;
  overnight: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
};

export type StaffProgressTodayStatus = {
  attendanceId: string | null;
  date: string;
  status: StaffProgressStatus;
  clockedIn: boolean;
  clockedOut: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  clockInStatus: string | null;
  minutesLate: number;
  totalWorkedToday: number;
  totalWorkedMinutes: number;
  totalWorkedHours: number;
  expectedMinutes: number;
  remainingMinutes: number;
  overtimeMinutes: number;
  overtime: boolean;
  scheduledEndTime: string | null;
  shiftCompleted: boolean;
  isIncomplete: boolean;
  clockIn: unknown | null;
  clockOut: unknown | null;
};

export type StaffProgress = {
  workedSeconds: number;
  expectedSeconds: number;
  progressPercentage: number;
  timeLeftSeconds: number;
  isOvertime: boolean;
  serverCalculated: boolean;
};

export type StaffProgressHistoryRecord = {
  id: string;
  date: string;
  status: StaffProgressStatus;
  clockIn: {
    time: string;
    status?: string | null;
    source?: string | null;
    mode?: string | null;
    location?: {
      longitude: number;
      latitude: number;
    } | null;
    withinBranchRadius?: boolean;
  } | null;
  clockOut: {
    time: string;
    source?: string | null;
    mode?: string | null;
    location?: {
      longitude: number;
      latitude: number;
    } | null;
    withinBranchRadius?: boolean;
  } | null;
  expectedStartTime: string;
  expectedEndTime: string;
  workedMinutes: number;
  workedHours: number;
  expectedMinutes: number;
  overtimeMinutes: number;
  minutesLate: number;
  isLate: boolean;
  isVeryLate: boolean;
  isIncomplete: boolean;
  break: {
    totalMinutes: number;
    segments: unknown[];
  };
  notes: string | null;
  approved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffProgressPermissions = {
  canClockIn: boolean;
  canClockOut: boolean;
  canEditAttendance: boolean;
  canRequestCorrection: boolean;
  canViewFullHistory: boolean;
  canWorkRemotely: boolean;
};

export type StaffProgressOffline = {
  allowed: boolean;
  requiresSync: boolean;
  maxOfflineActions: number;
  syncEndpoint: string;
  supportedActions: string[];
};

export type StaffProgressClockActions = {
  lastAction: string | null;
  lastActionAt: string | null;
  nextAllowedAction:
    | "clock-in"
    | "clock-out"
    | null;
  autoClockOutEnabled: boolean;
  autoClockOutAt: string | null;
};

export type StaffProgressData = {
  serverTime: string;
  staff: StaffProgressStaff;
  branch: StaffProgressBranch;
  date: StaffProgressDate;
  schedule: StaffProgressSchedule;
  todayStatus: StaffProgressTodayStatus;
  progress: StaffProgress;
  recentHistory: StaffProgressHistoryRecord[];
  permissions: StaffProgressPermissions;
  offline: StaffProgressOffline;
  clockActions: StaffProgressClockActions;
};

export type StaffProgressResponse = {
  success: boolean;
  message: string;
  data: StaffProgressData;
  meta: {
    generatedAt: string;
    requestId: string | null;
    apiVersion: string;
  };
};

/* ================= SERVICE ================= */

export const getStaffProgress = () => {
  return API.get<StaffProgressResponse>(
    "/admin/me/progress"
  );
};

