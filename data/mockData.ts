import { colors } from "@/theme/theme";
import { CurrentUser, DashboardData } from "@/types/dashboard";

// Placeholder — replace with the authenticated superadmin from your auth store.
export const currentUser: CurrentUser = {
  name: "Ada Nwosu",
  role: "Superadmin",
  initials: "AN",
  avatarUrl: null,
};

export const dashboardData: DashboardData = {
  institutionKpis: {
    total: 124,
    active: 98,
    disabled: 12,
    pending: 14,
    newThisPeriod: 8,
  },
  userKpis: {
    totalStaff: 3420,
    totalAdmins: 215,
    activeUsersToday: 1450,
    newSignupsThisPeriod: 320,
  },
  attendanceKpis: {
    todayClockIns: 1280,
    todayLateCount: 145,
    todayAbsentCount: 175,
    attendanceRatePercent: 88.5,
    onTimeRatePercent: 89.4,
  },
  subscriptionKpis: {
    activeCount: 98,
    trialCount: 16,
    expiredCount: 8,
    cancelledCount: 4,
    mrr: 1450000,
    currency: "NGN",
    mrrChangePercent: 12.4,
    churnRatePercent: 3.2,
    arpu: 14795,
  },
  latestInstitutions: [
    { id: "inst_01", name: "Apex Academy", logo: "https://example.com/logos/apex.png", plan: "Enterprise", staffCount: 240 },
    { id: "inst_02", name: "Beacon High", logo: null, plan: "Standard", staffCount: 85 },
    { id: "inst_03", name: "Crestwood Group", logo: "https://example.com/logos/crestwood.png", plan: "Pro", staffCount: 120 },
    { id: "inst_04", name: "Delta Tech", logo: null, plan: "Standard", staffCount: 45 },
    { id: "inst_05", name: "Epsilon Hub", logo: "https://example.com/logos/epsilon.png", plan: "Enterprise", staffCount: 310 },
  ],
  attendanceOverview: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    clockIns: [1150, 1280, 1220, 1310, 1240, 420, 150],
    late: [120, 145, 95, 110, 130, 40, 10],
  },
  revenueTrend: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    revenue: [950000, 1100000, 1250000, 1320000, 1400000, 1450000, 234500, 2100000, 2200000, 2300000, 2400000, 2500000],
  },
  planBreakdown: [
    { plan: "Standard", count: 45, color: colors.sky },
    { plan: "Pro", count: 35, color: colors.indigo },
    { plan: "Enterprise", count: 18, color: colors.violet },
  ],
  institutionComparison: [
    { id: "inst_01", name: "Apex Academy", attendancePercent: 94 },
    { id: "inst_03", name: "Crestwood Group", attendancePercent: 89 },
    { id: "inst_05", name: "Epsilon Hub", attendancePercent: 85 },
    { id: "inst_02", name: "Beacon High", attendancePercent: 78 },
  ],
};