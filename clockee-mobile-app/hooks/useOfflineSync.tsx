// hooks/useOfflineSync.ts
import { useEffect, useCallback, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { AppState } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncOfflineLogs } from "@/services/clockServices";
import { useAuth } from "@/context/AuthContext";

const OFFLINE_KEY = "offline_clockins";

export const useOfflineSync = () => {
  const { user } = useAuth();
  const isSyncing = useRef(false);

  const syncOfflineClockIns = useCallback(async () => {
    if (isSyncing.current) return;
    if (!user?.id) {
      console.log("⏳ Skipping sync - User not loaded");
      return;
    }

    try {
      isSyncing.current = true;

      const storedData = await AsyncStorage.getItem(OFFLINE_KEY);
      if (!storedData) return;

      let parsedData = JSON.parse(storedData);
      console.log("📦 Raw stored data:", parsedData);

      // === Handle different possible structures ===
      let offlineLogs: any[] = [];

      if (Array.isArray(parsedData)) {
        // Old format: direct array
        offlineLogs = parsedData;
        console.log(`🔄 Found ${offlineLogs.length} old-format records`);
      } 
      else if (parsedData?.offlineLogs?.length) {
        // New correct format
        offlineLogs = parsedData.offlineLogs;
        console.log(`🔄 Found ${offlineLogs.length} new-format records`);
      } 
      else {
        console.log("✅ No valid offline logs found");
        return;
      }

      if (offlineLogs.length === 0) return;

      console.log(`🔄 Attempting to sync ${offlineLogs.length} records...`);

      const payload = { offlineLogs };

      const response = await syncOfflineLogs(payload);

      if (response?.data?.success) {
        console.log("✅ Sync successful! Clearing queue.");
        await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify({ offlineLogs: [] }));
      } else {
        console.warn("⚠️ Server responded but not marked as success");
      }
    } catch (error: any) {
      console.error("❌ Sync failed:", error?.response?.data || error?.message || error);
    } finally {
      isSyncing.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    console.log("🔄 Offline Sync initialized for user:", user.id);

    const initialSync = async () => {
      const net = await NetInfo.fetch();
      if (net.isConnected) syncOfflineClockIns();
    };

    initialSync();

    const netUnsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log("🌐 Back online → Starting offline sync...");
        syncOfflineClockIns();
      }
    });

    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        NetInfo.fetch().then((state) => {
          if (state.isConnected) syncOfflineClockIns();
        });
      }
    });

    return () => {
      netUnsubscribe();
      appStateListener.remove();
    };
  }, [user?.id, syncOfflineClockIns]);
};
