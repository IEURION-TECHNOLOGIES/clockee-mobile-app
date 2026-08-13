import { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { loginUser, getProfile } from "../services/authService";
import { saveToken, getToken, removeToken } from "@/utils/token";
import { useQueryClient } from "@tanstack/react-query";



interface AuthContextType {
  user: any;
  loading: boolean;
  login: (
    email: string,
    password: string,
    deviceInfo: string
  ) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // ===============================
  // 🔥 NORMALIZE BACKEND RESPONSE
  // ===============================
  const extractUserData = (response: any) => {
    if (!response?.data) return null;

    // Handles:
    // Login → { user: {} }
    // Profile → { data: {} }
    return (
      response.data.user ||
      response.data.data ||
      response.data
    );
  };

  // ===============================
  // 🔥 FORMAT USER ROLES SAFELY
  // ===============================
  const formatUserData = (
    userData: any,
    session?: any
  ) => {
    if (!userData) return null;

    const rawRoles = userData.role;

    const roles = Array.isArray(rawRoles)
      ? rawRoles
      : rawRoles
      ? [rawRoles]
      : [];

    let primaryRole = "staff";

    if (roles.includes("super_admin")) {
      primaryRole = "super_admin";
    } else if (roles.includes("admin")) {
      primaryRole = "admin";
    }

    return {
      ...userData,
      roles,
      role: primaryRole,
      session: session || userData.session || null,
    };
  };

  // ===============================
  // 🔥 AUTO LOGIN ON APP START
  // ===============================
  useEffect(() => {
    const initializeAuth = async () => {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 10000);

      try {
        const token = await getToken();
        console.log("Auth init token:", token);

        if (!token) {
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        const res = await getProfile();
        const userData = extractUserData(res);

        console.log("Auto profile raw:", res?.data);
        console.log("Auto profile extracted:", userData);

        if (userData) {
          setUser(formatUserData(userData));
        } else {
          await removeToken();
          setUser(null);
        }
      } catch (error: any) {
        console.log("Auth init error:", error?.response?.status);

        if (error?.response?.status === 401) {
          await removeToken();
          setUser(null);
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ===============================
  // 🔥 LOGIN
  // ===============================
  const login = async (
    email: string,
    password: string,
    deviceInfo: string
  ) => {
    const res = await loginUser({
      email,
      password,
      deviceInfo,
    });

    console.log("Login response:", res.data);

    const { token, session } = res.data;
    const userData = extractUserData(res);

    if (!token || !userData) {
      throw new Error("Invalid login response");
    }

    const cleanUser = formatUserData(userData, session);

    await saveToken(token);
    setUser(cleanUser);

    return cleanUser;
  };

  // ===============================
  // 🔥 LOGOUT
  // ===============================
  const logout = async () => {
  await removeToken();

  // 🔥 CLEAR ALL REACT QUERY CACHE
  queryClient.clear();

  setUser(null);

  router.replace("/auth/generalAuth/Login");
};

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===============================
// 🔥 HOOK
// ===============================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  return context;
};
