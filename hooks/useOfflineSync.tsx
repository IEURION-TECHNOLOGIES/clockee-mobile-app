// hooks/useOfflineSync.ts

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  AppState,
  AppStateStatus,
} from "react-native";

import NetInfo from "@react-native-community/netinfo";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { syncOfflineLogs } from "@/services/clockServices";

import { useAuth } from "@/context/AuthContext";

const OFFLINE_KEY =
  "offline_clockins";

export const useOfflineSync = () => {
  const { user } = useAuth();

  // --------------------------------------------------
  // PREVENT MULTIPLE SIMULTANEOUS SYNCS
  // --------------------------------------------------

  const isSyncing =
    useRef(false);

  // --------------------------------------------------
  // PREVENT DUPLICATE INITIALIZATION
  // --------------------------------------------------

  const initializedUserId =
    useRef<string | null>(null);

  // --------------------------------------------------
  // PREVENT REPEATED NETWORK EVENTS
  // --------------------------------------------------

  const wasConnected =
    useRef<boolean | null>(null);

  // ==================================================
  // SYNC OFFLINE CLOCK-INS
  // ==================================================

  const syncOfflineClockIns =
    useCallback(async () => {
      // ----------------------------------------------
      // USER MUST EXIST
      // ----------------------------------------------

      if (!user?.id) {
        console.log(
          "⏳ Skipping offline sync - user not loaded"
        );

        return;
      }

      // ----------------------------------------------
      // DON'T RUN TWO SYNCS AT ONCE
      // ----------------------------------------------

      if (isSyncing.current) {
        console.log(
          "⏳ Offline sync already running..."
        );

        return;
      }

      try {
        isSyncing.current =
          true;

        console.log(
          "🔄 Checking offline clock-in queue..."
        );

        // --------------------------------------------
        // READ OFFLINE QUEUE
        // --------------------------------------------

        const storedData =
          await AsyncStorage.getItem(
            OFFLINE_KEY
          );

        if (!storedData) {
          console.log(
            "✅ No offline clock-ins found."
          );

          return;
        }

        // --------------------------------------------
        // PARSE STORAGE
        // --------------------------------------------

        let parsedData: any;

        try {
          parsedData =
            JSON.parse(
              storedData
            );
        } catch (parseError) {
          console.error(
            "❌ Invalid offline queue data:",
            parseError
          );

          return;
        }

        console.log(
          "📦 Raw offline queue:",
          parsedData
        );

        // --------------------------------------------
        // SUPPORT BOTH FORMATS
        // --------------------------------------------

        let offlineLogs: any[] =
          [];

        // Old format:
        //
        // [
        //   {...},
        //   {...}
        // ]

        if (
          Array.isArray(
            parsedData
          )
        ) {
          offlineLogs =
            parsedData;

          console.log(
            `🔄 Found ${offlineLogs.length} old-format offline records`
          );
        }

        // New format:
        //
        // {
        //   offlineLogs: [...]
        // }

        else if (
          Array.isArray(
            parsedData?.offlineLogs
          )
        ) {
          offlineLogs =
            parsedData.offlineLogs;

          console.log(
            `🔄 Found ${offlineLogs.length} offline records`
          );
        }

        // Invalid/empty format

        else {
          console.log(
            "✅ No valid offline logs found."
          );

          return;
        }

        // --------------------------------------------
        // NOTHING TO SYNC
        // --------------------------------------------

        if (
          offlineLogs.length === 0
        ) {
          console.log(
            "✅ Offline queue is empty."
          );

          return;
        }

        // --------------------------------------------
        // SYNC
        // --------------------------------------------

        console.log(
          `🔄 Attempting to sync ${offlineLogs.length} offline records...`
        );

        const payload = {
          offlineLogs,
        };

        const response =
          await syncOfflineLogs(
            payload
          );

        console.log(
          "📡 Offline sync response:",
          response?.data
        );

        // --------------------------------------------
        // SUCCESS
        // --------------------------------------------

        if (
          response?.data?.success
        ) {
          console.log(
            "✅ Offline sync successful."
          );

          // Clear the queue only after
          // the server confirms success.

          await AsyncStorage.setItem(
            OFFLINE_KEY,
            JSON.stringify({
              offlineLogs: [],
            })
          );

          console.log(
            "🧹 Offline queue cleared."
          );

          return;
        }

        // --------------------------------------------
        // SERVER RESPONSE BUT NOT SUCCESS
        // --------------------------------------------

        console.warn(
          "⚠️ Server responded but did not confirm successful sync."
        );

        // IMPORTANT:
        // Do NOT delete the offline records.
      } catch (error: any) {
        console.error(
          "❌ Offline sync failed:",
          error?.response?.data ||
            error?.message ||
            error
        );

        // IMPORTANT:
        // Do NOT clear the offline queue.
        //
        // The records will be retried when:
        //
        // - internet comes back
        // - app becomes active
        // - the hook initializes again
      } finally {
        isSyncing.current =
          false;
      }
    }, [user?.id]);

  // ==================================================
  // INITIALIZE OFFLINE SYNC
  // ==================================================

  useEffect(() => {
    // ----------------------------------------------
    // NO USER = NO SYNC
    // ----------------------------------------------

    if (!user?.id) {
      initializedUserId.current =
        null;

      wasConnected.current =
        null;

      return;
    }

    // ----------------------------------------------
    // PREVENT DUPLICATE INITIALIZATION
    // ----------------------------------------------

    if (
      initializedUserId.current ===
      user.id
    ) {
      console.log(
        "⏭️ Offline sync already initialized for user:",
        user.id
      );

      return;
    }

    initializedUserId.current =
      user.id;

    console.log(
      "🔄 Offline Sync initialized for user:",
      user.id
    );

    let mounted =
      true;

    // ==================================================
    // INITIAL SYNC
    // ==================================================

    const initialSync =
      async () => {
        try {
          const state =
            await NetInfo.fetch();

          if (!mounted) {
            return;
          }

          const connected =
            state.isConnected ===
            true;

          wasConnected.current =
            connected;

          console.log(
            "🌐 Initial network state:",
            connected
              ? "ONLINE"
              : "OFFLINE"
          );

          if (
            connected
          ) {
            await syncOfflineClockIns();
          }
        } catch (error) {
          console.error(
            "❌ Initial offline sync check failed:",
            error
          );
        }
      };

    initialSync();

    // ==================================================
    // NETWORK LISTENER
    // ==================================================

    const netUnsubscribe =
      NetInfo.addEventListener(
        (state) => {
          if (!mounted) {
            return;
          }

          const connected =
            state.isConnected ===
            true;

          // ------------------------------------------
          // FIRST NETWORK EVENT
          // ------------------------------------------

          if (
            wasConnected.current ===
            null
          ) {
            wasConnected.current =
              connected;

            return;
          }

          // ------------------------------------------
          // OFFLINE
          // ------------------------------------------

          if (!connected) {
            if (
              wasConnected.current !==
              false
            ) {
              console.log(
                "📴 Device went offline."
              );
            }

            wasConnected.current =
              false;

            return;
          }

          // ------------------------------------------
          // ONLINE
          // ------------------------------------------

          if (
            connected &&
            wasConnected.current ===
              false
          ) {
            console.log(
              "🌐 Back online → Starting offline sync..."
            );

            wasConnected.current =
              true;

            syncOfflineClockIns();

            return;
          }

          // ------------------------------------------
          // ALREADY ONLINE
          // ------------------------------------------

          wasConnected.current =
            true;
        }
      );

    // ==================================================
    // APP STATE LISTENER
    // ==================================================

    const appStateListener =
      AppState.addEventListener(
        "change",
        async (
          nextAppState: AppStateStatus
        ) => {
          if (!mounted) {
            return;
          }

          // ------------------------------------------
          // APP BECOMES ACTIVE
          // ------------------------------------------

          if (
            nextAppState ===
            "active"
          ) {
            try {
              const state =
                await NetInfo.fetch();

              if (!mounted) {
                return;
              }

              if (
                state.isConnected
              ) {
                console.log(
                  "📱 App became active → checking offline sync..."
                );

                await syncOfflineClockIns();
              }
            } catch (error) {
              console.error(
                "❌ App active sync check failed:",
                error
              );
            }
          }
        }
      );

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      mounted = false;

      netUnsubscribe();

      appStateListener.remove();

      console.log(
        "🧹 Offline Sync listeners cleaned up for user:",
        user.id
      );
    };
  }, [
    user?.id,
    syncOfflineClockIns,
  ]);
};
