// hooks/useOfflineSyncLogic.ts
import { useEffect, useCallback, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import AppState from "react-native/Libraries/AppState/AppState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncOfflineLogs } from "@/services/clockServices";

const OFFLINE_KEY = "offline_clockins";

export const useOfflineSyncLogic = (user: any) => {
  const isSyncing = useRef(false);

  const syncOfflineClockIns = useCallback(async () => {
    if (isSyncing.current || !user?.id) return;

    try {
      isSyncing.current = true;

      const stored = await AsyncStorage.getItem(OFFLINE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);
      if (!data?.offlineLogs?.length) return;

      console.log(`🔄 Syncing ${data.offlineLogs.length} offline records...`);

      const res = await syncOfflineLogs({ offlineLogs: data.offlineLogs });

      if (res?.data?.success) {
        console.log("✅ Sync successful - Clearing queue");
        await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify({ offlineLogs: [] }));
      }
    } catch (err: any) {
      console.error("❌ Sync error:", err?.response?.data || err);
    } finally {
      isSyncing.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const netUnsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) syncOfflineClockIns();
    });

    const appListener = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        NetInfo.fetch().then((n) => n.isConnected && syncOfflineClockIns());
      }
    });

    // Initial sync
    NetInfo.fetch().then((n) => n.isConnected && syncOfflineClockIns());

    return () => {
      netUnsubscribe();
      appListener.remove();
    };
  }, [user?.id, syncOfflineClockIns]);
};
