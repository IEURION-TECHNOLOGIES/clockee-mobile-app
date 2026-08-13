export interface CurrentUser {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string | null;
}

export interface InstitutionKpis {
  total: number;
  active: number;
  disabled: number;
  pending: number;
  newThisPeriod: number;
}

export interface UserKpis {
  totalStaff: number;
  totalAdmins: number;
  activeUsersToday: number;
  newSignupsThisPeriod: number;
}

export interface AttendanceKpis {
  todayClockIns: number;
  todayLateCount: number;
  todayAbsentCount: number;
  attendanceRatePercent: number;
  onTimeRatePercent: number;
}

export interface SubscriptionKpis {
  activeCount: number;
  trialCount: number;
  expiredCount: number;
  cancelledCount: number;
  mrr: number;
  currency: string;
  mrrChangePercent: number;
  churnRatePercent: number;
  arpu: number;
}

export interface LatestInstitution {
  id: string;
  name: string;
  logo: string | null;
  plan: string;
  staffCount: number;
}

export interface AttendanceOverview {
  labels: string[];
  clockIns: number[];
  late: number[];
}

export interface RevenueTrend {
  labels: string[];
  revenue: number[];
}

export interface PlanBreakdownItem {
  plan: string;
  count: number;
  color: string;
}

export interface InstitutionComparisonItem {
  id: string;
  name: string;
  attendancePercent: number;
}

export interface DashboardData {
  institutionKpis: InstitutionKpis;
  userKpis: UserKpis;
  attendanceKpis: AttendanceKpis;
  subscriptionKpis: SubscriptionKpis;
  latestInstitutions: LatestInstitution[];
  attendanceOverview: AttendanceOverview;
  revenueTrend: RevenueTrend;
  planBreakdown: PlanBreakdownItem[];
  institutionComparison: InstitutionComparisonItem[];
}