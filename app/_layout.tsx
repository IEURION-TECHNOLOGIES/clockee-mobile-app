// ======================= app/_layout.tsx =======================

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  Redirect,
  Stack,
  useSegments,
} from "expo-router";

import * as NativeSplashScreen from "expo-splash-screen";

import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import SplashScreen from "@/components/AppSplash";

import {
  AuthProvider,
  useAuth,
} from "@/context/AuthContext";

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { queryClient } from "@/lib/queryClient";
import {
  isAppBootCompleted,
  startAppBoot,
} from "@/lib/appBoot";

/*
 * Keep Expo's native splash visible while
 * React and the authentication provider load.
 */
NativeSplashScreen.preventAutoHideAsync().catch(
  () => {
    // Native splash may already be hidden.
  }
);

const CUSTOM_SPLASH_DURATION = 3000;

/* ================= AUTH GUARD ================= */

function AuthGuard({
  children,
  hasSeenDemo,
}: {
  children: React.ReactNode;
  hasSeenDemo: boolean | null;
}) {
  const {
    user,
    loading,
    initialized,
  } = useAuth();

  const segments = useSegments();

  /*
   * Do not render the custom splash here.
   *
   * This component should only handle
   * authentication redirects.
   */
  if (
    !initialized ||
    loading ||
    hasSeenDemo === null
  ) {
    return null;
  }

  if (!hasSeenDemo) {
    return (
      <Redirect href="/demopage/firstdemo" />
    );
  }

  const isAuthRoute =
    segments[0] === "auth";

  if (!user && isAuthRoute) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <Redirect href="/auth/generalAuth/Login" />
    );
  }

  return <>{children}</>;
}

/* ================= APP CONTENT ================= */

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

/* ================= ROOT CONTENT ================= */

function RootContent() {
  const {
    loading,
    initialized,
  } = useAuth();

  const [
    hasSeenDemo,
    setHasSeenDemo,
  ] = useState<boolean | null>(null);

  const [
    bootCompleted,
    setBootCompleted,
  ] = useState(() =>
    isAppBootCompleted()
  );

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDemoStatus = async () => {
      try {
        const seen =
          await AsyncStorage.getItem(
            "hasSeenDemo"
          );

        if (mounted) {
          setHasSeenDemo(seen === "true");
        }
      } catch (error) {
        if (mounted) {
          setHasSeenDemo(false);
        }
      }
    };

    loadDemoStatus();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (bootCompleted) {
      return;
    }

    const finishBoot = async () => {
      await startAppBoot(3000);

      if (mountedRef.current) {
        setBootCompleted(true);
      }
    };

    finishBoot();
  }, [bootCompleted]);

  const appIsLoading =
    !initialized ||
    loading ||
    hasSeenDemo === null;

  if (
    appIsLoading ||
    !bootCompleted
  ) {
    return <SplashScreen />;
  }

  return (
    <AuthGuard
      hasSeenDemo={hasSeenDemo}
    >
      <AppContent />
    </AuthGuard>
  );
}

/* ================= ROOT LAYOUT ================= */

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
