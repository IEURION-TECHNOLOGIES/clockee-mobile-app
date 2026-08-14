import { Redirect } from "expo-router";

import { useAuth } from "@/context/AuthContext";


export default function Index() {

  const {
    user,
    isReady,
  } = useAuth();


  /* =========================================================
     WAIT FOR AUTH
  ========================================================= */

  if (!isReady) {
    return null;
  }


  /* =========================================================
     LOGGED OUT
     
     The AppRouterController normally handles this,
     but keeping this fallback makes "/" safe.
  ========================================================= */

  if (!user) {
    return (
      <Redirect
        href="/auth/generalAuth/Login"
      />
    );
  }


  /* =========================================================
     DASHBOARD TYPE
  ========================================================= */

  const dashboardType =
    user.dashboardType;


  /* =========================================================
     SUPER ADMIN
  ========================================================= */

  if (
    dashboardType === "super_admin"
  ) {
    return (
      <Redirect
        href="/dashboard/superAdminDashboard/overview/Overview"
      />
    );
  }


  /* =========================================================
     OWNER
  ========================================================= */

  if (
    dashboardType === "owner"
  ) {
    return (
      <Redirect
        href="/dashboard/ownerDashboard/overview/Overview"
      />
    );
  }


  /* =========================================================
     ADMIN
  ========================================================= */

  if (
    dashboardType === "admin"
  ) {

    const branchId =
      user.branchId;

    if (!branchId) {

      console.error(
        "[Index] Admin user has no branchId"
      );

      return (
        <Redirect
          href="/auth/generalAuth/Login"
        />
      );
    }

    return (
      <Redirect
        href={
          `/dashboard/adminDashboard/${branchId}/overview/Overview` as any
        }
      />
    );
  }


  /* =========================================================
     STAFF
  ========================================================= */

  if (
    dashboardType === "staff"
  ) {
    return (
      <Redirect
        href="/dashboard/staffDashboard/overview"
      />
    );
  }


  /* =========================================================
     UNKNOWN DASHBOARD
  ========================================================= */

  console.warn(
    "[Index] Unknown dashboard type:",
    dashboardType
  );

  return (
    <Redirect
      href="/dashboard/staffDashboard/overview"
    />
  );
}
