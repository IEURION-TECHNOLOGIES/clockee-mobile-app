import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Stack,
  usePathname,
  useRouter,
  useRootNavigationState,
} from "expo-router";
import React, { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";

import SplashScreen from "@/components/AppSplash";

import {
  AuthProvider,
  useAuth,
} from "@/context/AuthContext";

import { useOfflineSync } from "@/hooks/useOfflineSync";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";


/* =========================================================
   CONSTANTS
========================================================= */

const DEMO_STORAGE_KEY = "hasSeenDemo";

const DEMO_ROUTE = "/demopage/firstdemo";

const LOGIN_ROUTE = "/auth/generalAuth/Login";

/**
 * Event fired when demo is completed.
 */
const DEMO_COMPLETED_EVENT =
  "CLOCKEE_DEMO_COMPLETED";

/**
 * Event fired by development reset.
 */
const ONBOARDING_RESET_EVENT =
  "CLOCKEE_ONBOARDING_RESET";


/* =========================================================
   APP ROUTER CONTROLLER
========================================================= */

function AppRouterController() {

  const router = useRouter();

  const pathname = usePathname();

  const rootNavigationState =
    useRootNavigationState();

  const {
    user,
    isReady,
  } = useAuth();


  /* =======================================================
     DEMO STATE
  ======================================================= */

  const [
    demoReady,
    setDemoReady,
  ] = useState(false);

  const [
    hasSeenDemo,
    setHasSeenDemo,
  ] = useState<boolean | null>(null);


  /* =======================================================
     LOAD DEMO STATUS
  ======================================================= */

  const loadDemoStatus = async () => {

    try {

      const value =
        await AsyncStorage.getItem(
          DEMO_STORAGE_KEY
        );

      const seen =
        value === "true";

      console.log(
        "[AppRouter] Demo storage:",
        value,
        "→",
        seen
      );

      setHasSeenDemo(seen);

    } catch (error) {

      console.error(
        "[AppRouter] Failed loading demo status:",
        error
      );

      setHasSeenDemo(false);

    } finally {

      setDemoReady(true);

    }
  };


  /* =======================================================
     INITIAL DEMO STATUS
  ======================================================= */

  useEffect(() => {

    let mounted = true;

    const initializeDemo = async () => {

      try {

        const value =
          await AsyncStorage.getItem(
            DEMO_STORAGE_KEY
          );

        const seen =
          value === "true";

        if (!mounted) return;

        console.log(
          "[AppRouter] Initial demo status:",
          {
            storedValue: value,
            hasSeenDemo: seen,
          }
        );

        setHasSeenDemo(seen);

      } catch (error) {

        console.error(
          "[AppRouter] Initial demo check failed:",
          error
        );

        if (!mounted) return;

        setHasSeenDemo(false);

      } finally {

        if (!mounted) return;

        setDemoReady(true);

      }
    };

    initializeDemo();

    return () => {
      mounted = false;
    };

  }, []);


  /* =======================================================
     DEMO COMPLETED EVENT
     
     THIS IS IMPORTANT.
     
     When the demo screen changes AsyncStorage,
     AppRouterController immediately updates its
     own React state.
  ======================================================= */

  useEffect(() => {

    const subscription =
      DeviceEventEmitter.addListener(
        DEMO_COMPLETED_EVENT,
        () => {

          console.log(
            "[AppRouter] Demo completed event received"
          );

          setHasSeenDemo(true);
          setDemoReady(true);

        }
      );

    return () => {
      subscription.remove();
    };

  }, []);


  /* =======================================================
     DEVELOPMENT RESET EVENT
  ======================================================= */

  useEffect(() => {

    const subscription =
      DeviceEventEmitter.addListener(
        ONBOARDING_RESET_EVENT,
        async () => {

          console.log(
            "[AppRouter] Onboarding reset received"
          );

          await AsyncStorage.setItem(
            DEMO_STORAGE_KEY,
            "false"
          );

          setHasSeenDemo(false);
          setDemoReady(true);

          router.replace(
            DEMO_ROUTE
          );

        }
      );

    return () => {
      subscription.remove();
    };

  }, [router]);


  /* =======================================================
     DEBUG
  ======================================================= */

  useEffect(() => {

    console.log(
      "[AppRouter]",
      {
        pathname,
        userId: user?.id,
        dashboardType:
          user?.dashboardType,
        isReady,
        demoReady,
        hasSeenDemo,
        navigationReady:
          !!rootNavigationState?.key,
      }
    );

  }, [
    pathname,
    user?.id,
    user?.dashboardType,
    isReady,
    demoReady,
    hasSeenDemo,
    rootNavigationState?.key,
  ]);


  /* =======================================================
     MAIN ROUTING
  ======================================================= */

  useEffect(() => {

    /* =====================================================
       1. WAIT FOR AUTH
    ===================================================== */

    if (!isReady) {
      return;
    }


    /* =====================================================
       2. WAIT FOR DEMO STATUS
    ===================================================== */

    if (!demoReady) {
      return;
    }

    if (hasSeenDemo === null) {
      return;
    }


    /* =====================================================
       3. WAIT FOR NAVIGATION
    ===================================================== */

    if (!rootNavigationState?.key) {

      console.log(
        "[AppRouter] Waiting for navigation..."
      );

      return;
    }


    /* =====================================================
       ROUTE TYPES
    ===================================================== */

    const isDemoRoute =
      pathname.startsWith("/demopage");

    const isAuthRoute =
      pathname.startsWith("/auth");


    /* =====================================================
       IMPORTANT FIX #1
       
       AUTHENTICATED USER ALWAYS WINS.
       
       Demo state must NEVER override an authenticated
       session.
    ===================================================== */

    if (user) {

      /**
       * If a logged-in user somehow reaches
       * the demo, immediately send them to dashboard.
       */
      if (isDemoRoute) {

        console.log(
          "[AppRouter] Authenticated user on demo → Dashboard"
        );

        router.replace("/");

        return;
      }


      /**
       * Logged-in user on login/auth screen.
       */
      if (isAuthRoute) {

        console.log(
          "[AppRouter] Authenticated user → Dashboard"
        );

        router.replace("/");

        return;
      }


      /**
       * User is already inside the application.
       */
      return;
    }


    /* =====================================================
       4. USER IS LOGGED OUT
    ===================================================== */

    if (!user) {


      /* ===================================================
         NEW USER
         
         Only logged-out users are affected by demo state.
      =================================================== */

      if (!hasSeenDemo) {

        /**
         * Already inside demo.
         */
        if (isDemoRoute) {
          return;
        }


        /**
         * User is on login.
         
         * This can happen immediately after Skip/Get Started
         * before the state event has finished propagating.
         *
         * Allow login.
         */
        if (isAuthRoute) {
          return;
        }


        console.log(
          "[AppRouter] New user → Demo"
        );

        router.replace(
          DEMO_ROUTE
        );

        return;
      }


      /* ===================================================
         DEMO COMPLETED
      =================================================== */

      if (
        hasSeenDemo &&
        isDemoRoute
      ) {

        console.log(
          "[AppRouter] Demo completed → Login"
        );

        router.replace(
          LOGIN_ROUTE
        );

        return;
      }


      /* ===================================================
         ALREADY ON AUTH
      =================================================== */

      if (isAuthRoute) {
        return;
      }


      /* ===================================================
         LOGGED OUT + PROTECTED ROUTE
      =================================================== */

      console.log(
        "[AppRouter] Logged out → Login"
      );

      router.replace(
        LOGIN_ROUTE
      );

    }

  }, [
    isReady,
    demoReady,
    hasSeenDemo,
    user,
    pathname,
    rootNavigationState?.key,
    router,
  ]);


  return null;
}


/* =========================================================
   APP CONTENT
========================================================= */

function AppContent() {

  const {
    isReady,
  } = useAuth();


  useOfflineSync();


  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />

      <AppRouterController />

      {/*
        Startup splash ONLY.

        Login does not trigger this.
        Logout does not trigger this.
        Navigation does not trigger this.
      */}
      {!isReady && (
        <SplashScreen />
      )}
    </>
  );
}


/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout() {

  return (
    <QueryClientProvider
      client={queryClient}
    >
      <AuthProvider>

        <AppContent />

      </AuthProvider>
    </QueryClientProvider>
  );
}
