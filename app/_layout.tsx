import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  Redirect,
  Stack,
  useSegments,
} from "expo-router";
import React, { useEffect, useState } from "react";

import SplashScreen from "@/components/AppSplash";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { queryClient } from "@/lib/queryClient";

const DEMO_STORAGE_KEY = "hasSeenDemo";
const DEMO_ROUTE = "/demopage/firstdemo";
const LOGIN_ROUTE = "/auth/generalAuth/Login";

// Global flags to survive remounts / Fast Refresh
const GLOBAL_KEY_DEMO_CHECKED = "__CLOCKEE_DEMO_CHECKED__";
const GLOBAL_KEY_HAS_SEEN_DEMO = "__CLOCKEE_HAS_SEEN_DEMO__";

function demoCheckedInSession(): boolean {
  if (typeof global !== "undefined") {
    return !!((global as any)[GLOBAL_KEY_DEMO_CHECKED]);
  }
  return false;
}

function setDemoCheckedInSession(): void {
  if (typeof global !== "undefined") {
    (global as any)[GLOBAL_KEY_DEMO_CHECKED] = true;
  }
}

function hasSeenDemoInSession(): boolean | null {
  if (typeof global !== "undefined") {
    return !!((global as any)[GLOBAL_KEY_HAS_SEEN_DEMO]);
  }
  return null;
}

function setHasSeenDemoInSession(value: boolean): void {
  if (typeof global !== "undefined") {
    (global as any)[GLOBAL_KEY_HAS_SEEN_DEMO] = value;
  }
}

function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, initialized, isInitializing } = useAuth();
  const segments = useSegments();

  // Initialize from global so remounts don't reset to null/true
  const [hasSeenDemo, setHasSeenDemo] = useState<boolean | null>(
    hasSeenDemoInSession()
  );

  const [checkingDemo, setCheckingDemo] = useState<boolean>(
    !demoCheckedInSession()
  );

  // Only check demo status when user is null (not logged in)
  useEffect(() => {
    if (user !== null) {
      // User is logged in → treat demo as done and skip checking
      setCheckingDemo(false);
      if (!hasSeenDemoInSession()) {
        setHasSeenDemoInSession(true);
        setHasSeenDemo(true);
      }
      return;
    }

    // If we already checked demo in this session, skip
    if (demoCheckedInSession()) {
      setCheckingDemo(false);
      setHasSeenDemo(hasSeenDemoInSession());
      return;
    }

    let mounted = true;

    async function checkDemoStatus() {
      try {
        const value = await AsyncStorage.getItem(
          DEMO_STORAGE_KEY
        );

        if (!mounted) return;

        const result = value === "true";
        setHasSeenDemo(result);
        setHasSeenDemoInSession(result);
      } catch (error) {
        console.error(
          "[AuthGuard] Failed to check demo status:",
          error
        );

        if (!mounted) return;

        setHasSeenDemo(false);
        setHasSeenDemoInSession(false);
      } finally {
        if (mounted) {
          setCheckingDemo(false);
          setDemoCheckedInSession();
        }
      }
    }

    checkDemoStatus();

    return () => {
      mounted = false;
    };
  }, [user]);

  const firstSegment = segments[0];

  const isAuthRoute = firstSegment === "auth";
  const isDemoRoute = firstSegment === "demopage";

  console.log("[AuthGuard]", {
    userId: user?.id,
    name: user?.name,
    branchId: user?.branchId,
    role: user?.role,
    dashboardType: user?.dashboardType,
    loading,
    initialized,
    isInitializing,
    checkingDemo,
    hasSeenDemo,
    firstSegment,
  });

  /*
   * Show splash ONLY while the app is initializing,
   * NOT while the user is logging in/out.
   */
  if (
    isInitializing ||
    checkingDemo ||
    hasSeenDemo === null
  ) {
    return <SplashScreen />;
  }

  /*
   * Demo flow (only for unauthenticated users)
   */
  if (!hasSeenDemo) {
    if (isDemoRoute) {
      return <>{children}</>;
    }

    return <Redirect href={DEMO_ROUTE} />;
  }

  if (hasSeenDemo && isDemoRoute) {
    return <Redirect href={LOGIN_ROUTE} />;
  }

  if (!user && isAuthRoute) {
    return <>{children}</>;
  }

  if (!user) {
    return <Redirect href={LOGIN_ROUTE} />;
  }

  return <>{children}</>;
}

function AppContent() {
  useOfflineSync();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <AppContent />
        </AuthGuard>
      </AuthProvider>
    </QueryClientProvider>
  );
}

