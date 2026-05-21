import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "@/components/AppSplash";

export default function Index() {
  const { user, loading } = useAuth();
  const [hasSeenDemo, setHasSeenDemo] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDemo = async () => {
      try {
        const seen = await AsyncStorage.getItem("hasSeenDemo");
        setHasSeenDemo(seen === "true");
      } catch {
        setHasSeenDemo(false);
      }
    };

    checkDemo();
  }, []);

  // 🔄 Show splash while loading
  if (loading || hasSeenDemo === null) {
    return <SplashScreen />;
  }

  // 🎬 Demo not seen
  if (!hasSeenDemo) {
    return <Redirect href="/demopage/firstdemo" />;
  }

  // 🔐 Not logged in
  if (!user) {
    return <Redirect href="/auth/generalAuth/Login" />;
  }

  // ==============================
  // ✅ DASHBOARD TYPE REDIRECTION
  // ==============================

  const dashboardType = user?.dashboardType;

  const DASHBOARD_ROUTES: Record<string, string> = {
    super_admin: "/dashboard/superAdminDashboard/overview/Overview",
    owner: "/dashboard/ownerDashboard/overview/Overview",
    admin: "/dashboard/adminDashboard/overview/Overview",
    staff: "/dashboard/staffDashboard/overview",
  };

  return (
    <Redirect
      href={
        DASHBOARD_ROUTES[dashboardType] ||
        "/dashboard/staffDashboard/overview"
      }
    />
  );
}

