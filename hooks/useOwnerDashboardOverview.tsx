import { useQuery } from '@tanstack/react-query';
import { getOwnerDashboardOverview } from '@/services/superAdminServices';


// Types matching your backend response
interface InstitutionProfile {
  id: string;
  name: string;
  type: string;
  owner: any;
  activePlan: any;
  subscriptionStatus: any;
  status: string;
  totalBranches: number;
  totalUsers: number;
}

interface InstitutionKpis {
  totalStaff: number;
  totalAdmins: number;
  totalBranches: number;
  activeDepartments: number;
  branchesEnabled: boolean;
  departmentsEnabled: boolean;
  systemStatus: string;
}

interface Subscription {
  activePlan: any;
  billingCycle: any;
  status: any;
  amount: number;
  currency: string;
  startedAt: any;
  currentPeriodEnd: any;
}

interface StaffAttendanceToday {
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  attendanceRate: string;
}

interface WeeklyAttendance {
  day: string;
  attendanceRate: number;
}

interface BranchBreakdown {
  id: string;
  name: string;
  branchesCount?: number;
  staffCount: number;
  attendance: string;
}

interface DepartmentBreakdown {
  id: string;
  name: string;
  staffCount: number;
  attendance: string;
}

interface RecentHire {
  id: string;
  name: string;
  role: string;
  branch: string;
  date: string;
}

interface DashboardData {
  institutionProfile: InstitutionProfile;
  institutionKpis: InstitutionKpis;
  subscription: Subscription;
  staffAttendanceToday: StaffAttendanceToday;
  weeklyStaffAttendance: WeeklyAttendance[];
  payrollTrend: any[];
  departmentStaffBreakdown: DepartmentBreakdown[];
  branchStaffBreakdown: BranchBreakdown[];
  recentStaffHires: RecentHire[];
}

// Custom hook using the service
export const useOwnerDashboardOverview = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['ownerDashboardOverview'],
    queryFn: async () => {
      const response = await getOwnerDashboardOverview();
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Dashboard fetch failed');
      }
      
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 min
    retry: 2, // Retry failed requests 2 times
    refetchOnWindowFocus: true, // Refetch when user returns to app
  });
};
