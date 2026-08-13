import API from "@/api/baseUrl";

/* ================= REGISTER & CREATE ================= */
export const registerAdmin = (data: any) => API.post("/admin/register", data);

export const createAdmin = (institutionId: string, data: any) =>
  API.post(`/admin/create/${institutionId}/admin`, data);

export const createAdminByOwner = (data: any) =>
  API.post(`/admin/create/admin`, data);

export const createStaff = (institutionId: string, data: any) =>
  API.post(`/admin/institutions/${institutionId}/staff`, data);

export const createStaffByAdmin = (data: any) =>
  API.post(`/admin/institutions/staff`, data);

/* ================= GET USERS ================= */
export const getInstitutions = () => API.get("/admin/institutions");

export const getAdmins = (institutionId: string) =>
  API.get(`/admin/admins`, { params: { institutionId } });

export const getStaffs = () => API.get(`/admin/institution/users`);

export const getStaffByInstitution = (institutionId: string) =>
  API.get("/admin/institution/users", {
    params: { id: institutionId, role: "staff" },
  });

export const getAdminByInstitution = (institutionId: string) =>
  API.get("/admin/institution/users", {
    params: { id: institutionId, role: "admin" },
  });

/* ================= SINGLE USER ================= */
export const getSingleUser = (userId: string) =>
  API.get(`/admin/institution/user/${userId}`);

/* ================= USER ACTIONS ================= */
export const allowRemoteClocking = async (
  userId: string,
  institutionId: string,
  allowed: boolean
) => {
  console.log("🌍 allowRemoteClocking API CALL");
  console.log("UserId:", userId);
  console.log("InstitutionId:", institutionId);
  console.log("Allowed:", allowed);

  try {
    const res = await API.patch(`/admin/users/${userId}/remote-access`, {
      institutionId,
      allowed,
    });

    console.log("✅ Remote Clocking Success:", res.data);
    return res;
  } catch (error: any) {
    console.error("❌ Remote Clocking Failed:");
    console.error("Status:", error.response?.status);
    console.error("Response Data:", error.response?.data);
    console.error("Message:", error.response?.data?.message);
    throw error;
  }
};


export const promoteToAdmin = (userId: string) =>
  API.patch(`/admin/users/${userId}/promote-admin`);

export const demoteToStaff = (userId: string) =>
  API.patch(`/admin/users/${userId}/demote-admin`);

export const deactivateUser = (userId: string) =>
  API.patch(`/admin/users/${userId}/deactivate`);

export const reactivateUser = (userId: string) =>
  API.patch(`/admin/users/${userId}/reactivate`);

export const editUser = (userId: string, data: any) =>
  API.patch(`/admin/users/${userId}/edit`, data);

/* ================= BRANCHES ================= */
export const createBranch = (data: any) =>
  API.post(`/admin/institution/branches`, data);

export const updateBranch = (branchId: string, data: any) =>
  API.patch(`/admin/institution/branches/update/${branchId}`, data);

export const getInstitutionBranches = (institutionId: string) =>
  API.get(`/admin/institution/branches`, { params: { institutionId } });

export const getStaffByBranch = (branchId: string) =>
  API.get(`/admin/institution/branches/${branchId}/staff`);

export const assignStaffToBranch = (
  institutionId: string,
  userId: string,
  branchId: string
) =>
  API.patch(
    `/admin/institution/branches/${institutionId}/assign-user/${userId}`,
    { branchId }
  );

export const assignStaffToBranchByAdmin = (
  institutionId: string,
  userId: string,
  branchId: string
) =>
  API.patch(
    `/admin/institution/branches/${institutionId}/assign-user/${userId}`,
    { branchId }
  );

  /* ================= DASHBOARD OVERVIEW ================= */
export const getDashboardOverview = () => API.get("/admin/dashboard/overview");

/* ================= OWNER DASHBOARD OVERVIEW ================= */
export const getOwnerDashboardOverview = () => 
  API.get("/admin/owner/dashboard/overview");



export type MonthName =
  | "january"
  | "february"
  | "march"
  | "april"
  | "may"
  | "june"
  | "july"
  | "august"
  | "september"
  | "october"
  | "november"
  | "december";

export type DailyLogStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT"
  | "ON_LEAVE"
  | "REMOTE";

export type DailyLog = {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  scheduledIn: string;
  scheduledOut: string;
  duration: number;
  lateMinutes: number;
  status: DailyLogStatus;
};

export type StaffAttendance = {
  id: string;
  name: string;
  staffId: string;
  role: string;
  department?: string;
  branch: string;
  month: MonthName;
  year?: number;
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  daysOnLeave: number;
  daysRemote: number;
  totalScheduledMinutes: number;
  totalWorkedMinutes: number;
  totalLateMinutes: number;
  totalOvertimeMinutes: number;
  totalBreakMinutes: number;
  attendanceRate: number;
  punctualityRate: number;
  perfectAttendanceDays: number;
  performanceRating: number;
  grade: "A" | "B" | "C" | "D" | "F";
  dailyLogs: DailyLog[];
};

export type ActivityActor = {
  id: string;
  name: string;
  role: string;
};

export type BranchLog = {
  id: string;
  timestamp: string;
  action:
    | "BRANCH_CREATED"
    | "BRANCH_SUSPENDED"
    | "BRANCH_ACTIVATED"
    | "BRANCH_UPDATED";
  actor: ActivityActor;
  target: {
    type: "branch";
    id: string;
    name: string;
  };
  description: string;
  month: MonthName;
  week: string;
  day: string;
};

export type BillingLog = {
  id: string;
  timestamp: string;
  action:
    | "SUBSCRIPTION_RENEWED"
    | "PAYMENT_RECEIVED"
    | "PAYMENT_FAILED"
    | "INVOICE_GENERATED";
  actor: ActivityActor;
  description: string;
  amount?: string;
  amountValue?: number;
  currency?: string;
  month: MonthName;
  week: string;
  day: string;
};

export type StaffLog = {
  id: string;
  timestamp: string;
  action:
    | "STAFF_ADDED"
    | "STAFF_REMOVED"
    | "STAFF_UPDATED"
    | "STAFF_PROMOTED";
  actor: ActivityActor;
  target: {
    type: "staff";
    id: string;
    name: string;
  };
  description: string;
  month: MonthName;
  week: string;
  day: string;
};

export type ActivityLogsResponse = {
  success: boolean;
  data: {
    attendance: StaffAttendance[];
    branchLogs: BranchLog[];
    billingLogs: BillingLog[];
    staffLogs: StaffLog[];
  };
};

export const getOwnerActivityLogs = (
  institutionId: string,
  month: MonthName,
  year: number
) => {
  return API.get<ActivityLogsResponse>(
    `/admin/owner/${institutionId}/activity-logs`,
    {
      params: {
        month,
        year,
      },
    }
  );
};


export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "inactive";

export type BillingCycle =
  | "monthly"
  | "yearly"
  | "annual"
  | null;

export type OwnerSubscription = {
  activePlan: string | null;
  planName: string | null;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startedAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
};

export const getOwnerCurrentSubscription = () =>
  API.get<OwnerSubscription | {
    success: boolean;
    data: OwnerSubscription;
  }>("/admin/owner/current-sub");



  /* ================= OWNER SUBSCRIPTION HISTORY ================= */

export type SubscriptionHistoryStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "cancelled"
  | "incomplete"
  | "unpaid"
  | "inactive"
  | "expired"
  | "free";

export type SubscriptionHistoryItem = {
  id: string;
  plan: string;
  status: SubscriptionHistoryStatus;
  billingCycle:
    | "monthly"
    | "yearly"
    | "annual"
    | null;
  amount: number;
  currency: string;
  startedAt: string;
  expiresAt: string | null;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type SubscriptionHistoryResponse = {
  success: boolean;
  total: number;
  data: {
    institution: {
      id: string;
      name: string;
    } | null;

    subscriptions: SubscriptionHistoryItem[];
  };
};

export const getOwnerSubscriptionHistory =
  () =>
    API.get<SubscriptionHistoryResponse>(
      "/admin/subscription/history"
    );



export type BranchStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending";

export type BranchAdminAttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "remote"
  | "onLeave"
  | "excused"
  | "notRecorded";

export type BranchAdminDashboardBranch = {
  _id: string;
  name: string;
  address: string;
  status: BranchStatus;
  radiusMeters: number;
};

export type BranchAdminDashboardAdmin = {
  _id: string;
  name: string;
  email: string;
  role: string[];
  avatar: string | null;
};

export type BranchAdminTodaySummary = {
  date: string;
  totalUsers: number;
  present: number;
  late: number;
  absent: number;
  remote: number;
  onLeave: number;
  excused: number;
  notRecorded: number;
  attended: number;
  attendanceRate: number;
};

export type BranchAdminTodayAttendance = {
  status: BranchAdminAttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  isLate: boolean;
  isRemote: boolean;
  isOnLeave: boolean;
};

export type BranchAdminStaff = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  departmentOrUnit: string | null;
  role: string[];
  branchId: string;
  todayAttendance: BranchAdminTodayAttendance;
};

export type BranchAdminDepartment = {
  name: string;
  staffCount: number;
  present: number;
  late: number;
  absent: number;
  remote: number;
  onLeave: number;
  attendanceRate: number;
};

export type BranchAdminWeeklyTrend = {
  date: string;
  day: string;
  totalUsers: number;
  attended: number;
  attendanceRate: number;
};

export type BranchAdminDashboardData = {
  branch: BranchAdminDashboardBranch;
  admin: BranchAdminDashboardAdmin;
  todaySummary: BranchAdminTodaySummary;
  staff: BranchAdminStaff[];
  departments: BranchAdminDepartment[];
  weeklyTrend: BranchAdminWeeklyTrend[];
  generatedAt: string;
};

export type BranchAdminDashboardResponse = {
  success: boolean;
  data: BranchAdminDashboardData;
};

/**
 * Dashboard overview for a specific branch.
 *
 * Current assumed route:
 * GET /admin/branch/:branchId/dashboard/overview
 */
export const getBranchAdminDashboardOverview = (
  branchId: string
) => {
  if (!branchId) {
    throw new Error(
      "branchId is required to load the branch dashboard"
    );
  }

  console.log(
    "[BranchDashboard API] Loading branch:",
    branchId
  );

  return API.get<BranchAdminDashboardResponse>(
    `/admin/branches/${branchId}/dashboard-overview`
  );
};



export type AttendanceFilters = {
  from?: string;
  to?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  day: string;
  attendanceStatus: string;

  staff: {
    id: string;
    name: string;
    email?: string;
    staffId?: string;
    department?: string;
    jobTitle?: string;
    avatar?: string | null;
  };

  branch?: {
    id: string;
    name: string;
  };

  schedule?: {
    id?: string;
    name?: string;
    expectedStartTime?: string;
    expectedEndTime?: string;
    expectedWorkMinutes?: number;
    gracePeriodMinutes?: number;
    breakDurationMinutes?: number;
  };

  clockIn?: {
    time?: string | null;
    localTime?: string | null;
    status?: string;
    minutesLate?: number;
    method?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      verified?: boolean;
      distanceFromBranchMeters?: number;
    };
  } | null;

  clockOut?: {
    time?: string | null;
    localTime?: string | null;
    status?: string;
    method?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      verified?: boolean;
      distanceFromBranchMeters?: number;
    };
  } | null;

  workedMinutes: number;
  workedHours: number;
  expectedMinutes: number;
  remainingMinutes: number;
  overtimeMinutes: number;

  isLate: boolean;
  isVeryLate: boolean;
  isIncomplete: boolean;
  isOvertime: boolean;
  locationVerified: boolean;
  approved: boolean;

  approvedBy?: {
    id: string;
    name: string;
  } | null;

  approvedAt?: string | null;
  notes?: string | null;
};

export type BranchAttendanceResponse = {
  success: boolean;
  message: string;

  data: {
    branch: {
      id: string;
      name: string;
      code?: string;
      address?: string;
      timezone?: string;
      locationVerificationRequired?: boolean;
      status?: string;
    };

    dateRange: {
      from: string;
      to: string;
      timezone?: string;
    };

    summary: {
      totalStaff: number;
      scheduledStaff: number;
      presentStaff: number;
      lateStaff: number;
      absentStaff: number;
      incompleteStaff: number;
      onLeaveStaff: number;
      totalClockIns: number;
      totalClockOuts: number;
      totalWorkedMinutes: number;
      totalWorkedHours: number;
      expectedMinutes: number;
      expectedHours: number;
      attendanceRatePercent: number;
      punctualityRatePercent: number;
      completionRatePercent: number;
    };

    filters: {
      status: string;
      search: string;
      from: string;
      to: string;
    };

    records: AttendanceRecord[];

    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export async function getBranchAttendanceLogs(
  branchId: string,
  filters: AttendanceFilters = {}
) {
  if (!branchId) {
    throw new Error(
      "Branch ID is required to fetch attendance logs."
    );
  }

  const params: Record<string, string | number> = {};

  if (filters.from) {
    params.from = filters.from;
  }

  if (filters.to) {
    params.to = filters.to;
  }

  if (
    filters.status &&
    filters.status !== "all"
  ) {
    params.status = filters.status;
  }

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.page) {
    params.page = filters.page;
  }

  if (filters.limit) {
    params.limit = filters.limit;
  }

  const response =
    await API.get<BranchAttendanceResponse>(
      `/admin/branches/${branchId}/attendance-logs`,
      {
        params,
      }
    );

  return response.data;
}

