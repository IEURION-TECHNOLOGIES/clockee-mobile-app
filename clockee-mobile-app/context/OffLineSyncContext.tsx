// context/OfflineSyncContext.tsx
import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useOfflineSyncLogic } from "@/hooks/useOfflineSyncLogic";

const OfflineSyncContext = createContext({});

export const OfflineSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useOfflineSyncLogic(user);   // Pass user to the logic

  return (
    <OfflineSyncContext.Provider value={{}}>
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => useContext(OfflineSyncContext);
