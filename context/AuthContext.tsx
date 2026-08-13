import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import {
  loginUser,
  getProfile,
} from "../services/authService";

import {
  saveToken,
  getToken,
  removeToken,
} from "@/utils/token";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  initialized: boolean;
  isInitializing: boolean;
  login: (
    email: string,
    password: string,
    deviceInfo: string
  ) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<
  AuthContextType | null
>(null);

// Global flag: survives remounts and most Fast Refresh scenarios
const GLOBAL_KEY = "__CLOCKEE_AUTH_INITIALIZED__";

function hasInitializedInSession(): boolean {
  if (typeof global !== "undefined") {
    return !!((global as any)[GLOBAL_KEY]);
  }
  return false;
}

function setInitializedInSession(): void {
  if (typeof global !== "undefined") {
    (global as any)[GLOBAL_KEY] = true;
  }
}

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const queryClient = useQueryClient();

  const extractUserData = (response: any) => {
    if (!response?.data) {
      return null;
    }

    return (
      response.data.user ||
      response.data.data ||
      response.data
    );
  };

  const formatUserData = (
    userData: any,
    session?: any
  ) => {
    if (!userData) {
      return null;
    }

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
      session:
        session || userData.session || null,
    };
  };

  useEffect(() => {
    if (hasInitializedInSession()) {
      // Already initialized in this JS session; do nothing.
      setLoading(false);
      setInitialized((prev) => prev || true);
      setIsInitializing(false);
      return;
    }

    setInitializedInSession();

    let mounted = true;

    async function initializeAuth() {
      try {
        setLoading(true);

        const token = await getToken();

        console.log(
          "[AuthProvider] Auth init token:",
          token ? "exists" : "null"
        );

        if (!token) {
          if (mounted) {
            setUser(null);
          }

          return;
        }

        const response = await getProfile();
        const userData = extractUserData(response);

        console.log(
          "[AuthProvider] Profile extracted:",
          userData
        );

        if (!mounted) {
          return;
        }

        if (userData) {
          setUser(formatUserData(userData));
        } else {
          await removeToken();
          setUser(null);
        }
      } catch (error: any) {
        console.error(
          "[AuthProvider] Auth initialization error:",
          error?.response?.status,
          error?.message
        );

        if (
          error?.response?.status === 401
        ) {
          await removeToken();
        }

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized((prev) => prev || true);
          setIsInitializing(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    deviceInfo: string
  ) => {
    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
        deviceInfo,
      });

      console.log(
        "[AuthProvider] Login response:",
        response.data
      );

      const { token, session } = response.data;
      const userData = extractUserData(response);

      if (!token || !userData) {
        throw new Error(
          "Invalid login response"
        );
      }

      const cleanUser = formatUserData(
        userData,
        session
      );

      await saveToken(token);

      setUser(cleanUser);

      return cleanUser;
    } finally {
      setLoading(false);
      setInitialized((prev) => prev || true);
      // Do NOT change isInitializing here
    }
  };

  const logout = async () => {
    try {
      await removeToken();
      queryClient.clear();
      setUser(null);

      // Do NOT reset initialized / isInitializing here
    } catch (error) {
      console.error("[AuthProvider] Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
