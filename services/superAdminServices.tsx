// src/services/admin.ts
import API from "@/api/baseUrl";

/* ================= REGISTER & CREATE ================= */

export const registerAdmin = (data: any) =>
  API.post("/admin/register", data);

export const createAdmin = (
  institutionId: string,
  data: any
) =>
  API.post(
    `/admin/create/${institutionId}/admin`,
    data
  );

export const createAdminByOwner = (data: any) =>
  API.post("/admin/create/admin", data);

export const createStaff = (
  institutionId: string,
  data: any
) =>
  API.post(
    `/admin/institutions/${institutionId}/staff`,
    data
  );

export const createStaffByAdmin = (data: any) =>
  API.post("/admin/institutions/staff", data);

/* ================= GET USERS ================= */

export const getInstitutions = () =>
  API.get("/admin/institutions");

export const getAdmins = (
  institutionId: string
) =>
  API.get("/admin/admins", {
    params: { institutionId },
  });

export const getStaffs = () =>
  API.get("/admin/institution/users");

export const getStaffByInstitution = (
  institutionId: string
) =>
  API.get("/admin/institution/users", {
    params: {
      id: institutionId,
      role: "staff",
    },
  });

export const getAdminByInstitution = (
  institutionId: string
) =>
  API.get("/admin/institution/users", {
    params: {
      id: institutionId,
      role: "admin",
    },
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
    const response = await API.patch(
      `/admin/users/${userId}/remote-access`,
      {
        institutionId,
        allowed,
      }
    );

    console.log(
      "✅ Remote Clocking Success:",
      response.data
    );

    return response;
  } catch (error: any) {
    console.error(
      "❌ Remote Clocking Failed:"
    );
    console.error(
      "Status:",
      error.response?.status
    );
    console.error(
      "Response Data:",
      error.response?.data
    );
    console.error(
      "Message:",
      error.response?.data?.message
    );

    throw error;
  }
};

export const promoteToAdmin = (userId: string) =>
  API.patch(
    `/admin/users/${userId}/promote-admin`
  );

export const demoteToStaff = (userId: string) =>
  API.patch(
    `/admin/users/${userId}/demote-admin`
  );

export const deactivateUser = (userId: string) =>
  API.patch(
    `/admin/users/${userId}/deactivate`
  );

export const reactivateUser = (userId: string) =>
  API.patch(
    `/admin/users/${userId}/reactivate`
  );

export const editUser = (
  userId: string,
  data: any
) =>
  API.patch(
    `/admin/users/${userId}/edit`,
    data
  );

/* ================= BRANCHES ================= */

export const createBranch = (data: any) =>
  API.post(
    "/admin/institution/branches",
    data
  );

export const updateBranch = (
  branchId: string,
  data: any
) =>
  API.patch(
    `/admin/institution/branches/update/${branchId}`,
    data
  );

export const getInstitutionBranches = (
  institutionId: string
) =>
  API.get("/admin/institution/branches", {
    params: { institutionId },
  });

export const getStaffByBranch = (
  branchId: string
) =>
  API.get(
    `/admin/institution/branches/${branchId}/staff`
  );

export const assignStaffToBranch = (
  institutionId: string,
  userId: string,
  branchId: string
) =>
  API.patch(
    `/admin/institution/branches/${institutionId}/assign-user/${userId}`,
    {
      branchId,
    }
  );

export const assignStaffToBranchByAdmin = (
  institutionId: string,
  userId: string,
  branchId: string
) =>
  API.patch(
    `/admin/institution/branches/${institutionId}/assign-user/${userId}`,
    {
      branchId,
    }
  );

/* ================= SHIFTS ================= */

export type CreateShiftPayload = {
  name: string;
  startTime: string;
  endTime: string;
  gracePeriod: number;
  branchId: string;
  repeatDays: string[];
};

export type Shift = {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriod: number;
  branchId: string;
  repeatDays: string[];
  assignedUsers?: Array<{
    _id?: string;
    name?: string;
    role?: string | string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateShiftResponse = {
  success?: boolean;
  message?: string;
  data?: Shift | { shift: Shift };
};

export type AssignStaffToShiftPayload = {
  userIds: string[];
};

export type AssignStaffToShiftResponse = {
  success?: boolean;
  message?: string;
  data?: Shift | { shift: Shift };
};

export const createShiftByAdmin = (
  data: CreateShiftPayload
) => {
  if (!data.name.trim()) {
    throw new Error(
      "Shift name is required."
    );
  }

  if (!data.startTime.trim()) {
    throw new Error(
      "Shift start time is required."
    );
  }

  if (!data.endTime.trim()) {
    throw new Error(
      "Shift end time is required."
    );
  }

  if (!data.branchId.trim()) {
    throw new Error(
      "Branch ID is required to create a shift."
    );
  }

  if (!data.repeatDays.length) {
    throw new Error(
      "At least one repeat day is required."
    );
  }

  return API.post<CreateShiftResponse>(
    "/admin/shifts",
    data
  );
};

export const assignStaffToShiftByAdmin = (
  shiftId: string,
  userIds: string[]
) => {
  if (!shiftId.trim()) {
    throw new Error(
      "Shift ID is required to assign staff."
    );
  }

  if (!userIds.length) {
    throw new Error(
      "At least one user ID is required."
    );
  }

  return API.patch<AssignStaffToShiftResponse>(
    `/admin/shifts/${shiftId}/assign`,
    {
      userIds,
    }
  );
};

/* ================= MANUAL OVERRIDE ================= */

export type ManualOverridePayload = {
  userId: string;
  actionType: "clock-in" | "clock-out";
  branchId: string;
  reason: string;
};

export type ManualOverrideResponse = {
  success?: boolean;
  message?: string;
  data?: any;
};

export const manualOverrideClock = (
  payload: ManualOverridePayload
) => {
  if (!payload.userId.trim()) {
    throw new Error(
      "User ID is required for manual override."
    );
  }

  if (!payload.branchId.trim()) {
    throw new Error(
      "Branch ID is required for manual override."
    );
  }

  if (!payload.reason.trim()) {
    throw new Error(
      "Reason is required for manual override."
    );
  }

  return API.post<ManualOverrideResponse>(
    "/clock/admin/override",
    payload
  );
};

/* ================= DASHBOARD OVERVIEW ================= */

export const getDashboardOverview = () =>
  API.get("/admin/dashboard/overview");

export const getOwnerDashboardOverview = () =>
  API.get("/admin/owner/dashboard/overview");

/* ================= ATTENDANCE TYPES ================= */

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

/* ================= SUBSCRIPTION ================= */

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
  API.get<
    OwnerSubscription | {
      success: boolean;
      data: OwnerSubscription;
    }
  >("/admin/owner/current-sub");

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

export const getOwnerSubscriptionHistory = () =>
  API.get<SubscriptionHistoryResponse>(
    "/admin/subscription/history"
  );

/* ================= BRANCH DASHBOARD ================= */

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

/* ================= BRANCH ATTENDANCE ================= */

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

  const params: Record<
    string,
    string | number
  > = {};

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
/* ================= PARENT PORTAL ================= */
/* ARCHITECTURE BOUNDARY: Parent accounts are strictly read-only.
   No clocking or attendance-edit calls belong in this file. */

export type ParentChildToday = {
  attendance: "present" | "absent" | "late" | "excused" | string;
  attendanceNotes: string | null;
  clockIn: string | null;
  clockOut: string | null;
};

export type ParentChild = {
  id: string;
  name: string;
  email: string;
  studentOrStaffId: string;
  today: ParentChildToday;
};

export type ParentDashboardResponse = {
  success: boolean;
  data: {
    parent: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    institution: {
      name: string;
      type: string;
    };
    children: ParentChild[];
  };
};

export const getParentDashboard = () =>
  API.get<ParentDashboardResponse>("/parent/dashboard");

export const getParentChildren = () =>
  API.get("/parent/children");

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type ChildAttendanceFilters = {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
};

export type ChildAttendanceRecord = {
  _id: string;
  studentId: string;
  institutionId: string;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  recordedBy: string;
  recordedAt: string;
  source: string;
};

export type ChildAttendanceResponse = {
  success: boolean;
  data: {
    student: {
      id: string;
      name: string;
      email: string;
      phone: string;
      studentOrStaffId: string;
    };
    records: ChildAttendanceRecord[];
  };
};

export const getChildAttendance = (
  studentId: string,
  filters: ChildAttendanceFilters = {}
) => {
  if (!studentId) {
    throw new Error("studentId is required to fetch attendance.");
  }

  const params: Record<string, string> = {};
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return API.get<ChildAttendanceResponse>(
    `/parent/children/${studentId}/attendance`,
    { params }
  );
};

export const getChildClockHistory = (studentId: string) => {
  if (!studentId) {
    throw new Error("studentId is required to fetch clock history.");
  }

  // SECURITY RESTRICTION: backend 403s if studentId isn't linked to this parent.
  return API.get(`/parent/children/${studentId}/clock-history`);
};

/* ================= STUDENT CLOCKING (STAFF-ASSISTED) ================= */
/* =========================================================
   STUDENT CLOCKING (STAFF-ASSISTED)
========================================================= */

export type StudentClockInPayload = {
  gps?: {
    lat: number;
    lng: number;
  };
  deviceInfo?: string;
  mode?: "qr" | "silent";
};

export type StudentClockInResponse = {
  success: boolean;
  message?: string;
  data?: {
    log: {
      _id: string;
      mode: string;
    };
    parentNotification?: {
      sent: number;
      failed: number;
    };
  };
};

export const studentClockIn = (
  studentId: string,
  payload: StudentClockInPayload
) =>
  API.post<StudentClockInResponse>(
    `/clock/students/${studentId}/clock-in`,
    payload
  );
  
/* ================= BULK STUDENT ATTENDANCE (STAFF) ================= */

export type BulkAttendanceRecordInput = {
  studentId: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
};

export type BulkAttendancePayload = {
  date?: string; // YYYY-MM-DD, defaults to today on backend
  records: BulkAttendanceRecordInput[];
};

export type BulkAttendanceResponse = {
  success: boolean;
  data: {
    date: string;
    records: {
      studentId: string;
      success: boolean;
      record?: any;
      message?: string;
    }[];
  };
};

export const bulkUpsertStudentAttendance = (payload: BulkAttendancePayload) =>
  API.post<BulkAttendanceResponse>("/clock/students/attendance", payload);

/* ================= STUDENT ROSTER WITH ATTENDANCE (STAFF) ================= */

export type StudentRosterFilters = {
  departmentId?: string;
  search?: string;
  date?: string; // YYYY-MM-DD
};

export type StudentRosterItem = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  studentOrStaffId: string;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  };
  departmentName?: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string | null;
};

export type StudentRosterResponse = {
  success: boolean;
  date: string;
  count: number;
  data: StudentRosterItem[];
};

export const getStudentRoster = (filters: StudentRosterFilters = {}) =>
  API.get<StudentRosterResponse>("/clock/students/roster", {
    params: filters,
  });

/* ================= STUDENTS LIST (STAFF PICKER) ================= */

export type StudentsListFilters = {
  search?: string;
  departmentId?: string;
};

export type StudentListItem = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  studentOrStaffId: string;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  };
  departmentName?: string;
};

export type StudentsListResponse = {
  success: boolean;
  count: number;
  data: StudentListItem[];
};

export const getStudentsList = (filters: StudentsListFilters = {}) =>
  API.get<StudentsListResponse>("/clock/students", {
    params: filters,
  });

/* ================= ADMIN: STUDENTS MANAGEMENT ================= */

export type CreateStudentPayload = {
  name: string;
  email: string;
  studentId: string;
  phone: string;
  departmentId?: string;
  branchId?: string;
  password?: string;

  // Parent 1
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentPassword?: string;

  // Parent 2 (optional)
  parent2Name?: string;
  parent2Email?: string;
  parent2Phone?: string;
  parent2Password?: string;
};

export const createStudent = (data: CreateStudentPayload) =>
  API.post("/admin/students", data);

/* ================= ADMIN: BULK UPLOAD STUDENTS ================= */

// multipart/form-data CSV upload
export const bulkUploadStudents = (formData: FormData) =>
  API.post("/admin/students/bulk", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/* ================= ADMIN: STUDENTS LIST & DETAIL ================= */

export type AdminStudentsFilters = {
  role?: "student";
  search?: string;
  departmentId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
};

export const getAdminStudents = (filters: AdminStudentsFilters = {}) =>
  API.get("/admin/institution/users", {
    params: {
      ...filters,
      role: filters.role ?? "student",
    },
  });

export const getAdminStudentById = (id: string) =>
  API.get(`/admin/institution/user/${id}`);

export const getStudentsImportTemplate = () =>
  API.get("/admin/students/import-template", {
    responseType: "blob",
  });
  