import { Redirect } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user } = useAuth();

  const dashboardType =
    user?.dashboardType;

  const dashboardRoutes: Record<
    string,
    string
  > = {
    super_admin:
      "/dashboard/superAdminDashboard/overview/Overview",

    owner:
      "/dashboard/ownerDashboard/overview/Overview",

    admin:
      "/dashboard/adminDashboard/[branchId]/overview/Overview",

    staff:
      "/dashboard/staffDashboard/overview",
  };

  const destination =
    dashboardRoutes[dashboardType] ||
    "/dashboard/staffDashboard/overview/overview";

  return (
    <Redirect href={destination as any} />
  );
}
