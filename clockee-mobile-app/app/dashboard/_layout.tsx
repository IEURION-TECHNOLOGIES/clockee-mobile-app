import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // 🔥 If no user → kick out
  if (!user) {
    return <Redirect href="/auth/generalAuth/Login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
