import { useState, useEffect, useCallback } from "react";
import { getDashboardOverview } from "@/services/superAdminServices"; // Update with your actual service import path

export interface DashboardData {
  institutionKpis: {
    total: number;
    active: number;
    disabled: number;
    pending: number;
    newThisPeriod: number;
  };
  userKpis: {
    totalStaff: number;
    totalAdmins: number;
    activeUsersToday: number;
    newSignupsThisPeriod: number;
  };
  attendanceKpis: {
    todayClockIns: number;
    todayLateCount: number;
    todayAbsentCount: number;
    attendanceRatePercent: number;
    onTimeRatePercent: number;
  };
  subscriptionKpis: {
    activeCount: number;
    trialCount: number;
    expiredCount: number;
    cancelledCount: number;
    mrr: number;
    currency: string;
    mrrChangePercent: number;
    churnRatePercent: number;
    arpu: number;
  };
  latestInstitutions: {
    _id: string;
    name: string;
    id: string;
    logo: string | null;
    plan: string | null;
    staffCount: number;
  }[];
  attendanceOverview: {
    labels: string[];
    clockIns: number[];
    late: number[];
  };
  revenueTrend: {
    labels: string[];
    revenue: number[];
  };
  planBreakdown: any[];
  institutionComparison: any[];
}

export const useDashboardOverview = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardOverview();
      // Adjust based on your API response structure (e.g., response.data.data or response.data)
      setData(response.data);
    } catch (err: any) {
      console.error("❌ Failed to fetch dashboard overview:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};