// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Stack } from "expo-router";
import { useOfflineSync } from "@/hooks/useOfflineSync";

function AppContent() {
  useOfflineSync();        // ← Must be inside AuthProvider
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
