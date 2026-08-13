import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  getProfile,
  loginUser,
} from "@/services/authService";
import {
  getToken,
  removeToken,
  saveToken,
} from "@/utils/token";

type AuthUser = any;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  initialized: boolean;
  login: (
    email: string,
    password: string,
    deviceInfo: string
  ) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | null>(null);

/* ================= RESPONSE HELPERS ================= */

const extractUserData = (response: any) => {
  if (!response?.data) {
    console.warn(
      "[Auth] Response has no data:",
      response
    );

    return null;
  }

  const extractedUser =
    response.data.user ||
    response.data.data?.user ||
    response.data.data ||
    response.data;

  console.log(
    "[Auth] Extracted user:",
    {
      userId:
        extractedUser?.id ||
        extractedUser?._id,

      branchId:
        extractedUser?.branchId,

      branchObjectId:
        extractedUser?.branch?._id ||
        extractedUser?.branch?.id,

      name:
        extractedUser?.name,
    }
  );

  return extractedUser;
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
  } else if (roles.includes("owner")) {
    primaryRole = "owner";
  } else if (roles.includes("admin")) {
    primaryRole = "admin";
  } else if (roles.includes("staff")) {
    primaryRole = "staff";
  }

  const branchId =
    userData.branchId ||
    userData.branch?._id ||
    userData.branch?.id ||
    null;

  const institutionId =
    userData.institutionId ||
    userData.institution?._id ||
    userData.institution?.id ||
    null;

  const formattedUser = {
    ...userData,

    id:
      userData.id ||
      userData._id,

    branchId,

    institutionId,

    roles,

    role: primaryRole,

    session:
      session ||
      userData.session ||
      null,
  };

  console.log(
    "[Auth] Formatted user:",
    {
      id: formattedUser.id,
      branchId: formattedUser.branchId,
      institutionId:
        formattedUser.institutionId,
      role: formattedUser.role,
      roles: formattedUser.roles,
    }
  );

  return formattedUser;
};


let authInitializationPromise:
  Promise<AuthUser | null> | null = null;

function initializeAuthOnce(): Promise<AuthUser | null> {
  /*
   * If another AuthProvider instance already
   * started initialization, reuse the same promise.
   */
  if (authInitializationPromise) {
    console.log(
      "[Auth] Reusing existing initialization promise."
    );

    return authInitializationPromise;
  }

  authInitializationPromise =
    (async () => {
      console.log(
        "[Auth] Starting authentication initialization..."
      );

      try {
        const token = await getToken();

        console.log(
          "[Auth] Stored token:",
          token ? "exists" : "missing"
        );

        if (!token) {
          console.log(
            "[Auth] No token found. User is logged out."
          );

          return null;
        }

        const response = await getProfile();

        const userData =
          extractUserData(response);

        if (!userData) {
          console.log(
            "[Auth] Profile unavailable. Removing token."
          );

          await removeToken();

          return null;
        }

        const formattedUser =
          formatUserData(userData);

        console.log(
          "[Auth] Profile loaded successfully."
        );

        return formattedUser;
      } catch (error: any) {
        console.error(
          "[Auth] Initialization error:",
          error?.response?.data ||
            error?.message ||
            error
        );

        if (
          error?.response?.status === 401
        ) {
          await removeToken();
        }

        return null;
      }
    })();

  return authInitializationPromise;
}

/* ================= PROVIDER ================= */
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser>(null);

  const [loading, setLoading] =
    useState(true);

  const [initialized, setInitialized] =
    useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const loadAuth = async () => {
      const authenticatedUser =
        await initializeAuthOnce();

      if (!mounted) {
        return;
      }

      setUser(authenticatedUser);
      setInitialized(true);
      setLoading(false);

      console.log(
        "[Auth] Initialization completed."
      );
    };

    loadAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    deviceInfo: string
  ) => {
    const response = await loginUser({
      email,
      password,
      deviceInfo,
    });

    const {
      token,
      session,
    } = response.data;

    const userData =
      extractUserData(response);

    if (!token || !userData) {
      throw new Error(
        "Invalid login response."
      );
    }

    const formattedUser =
      formatUserData(userData, session);

    await saveToken(token);

    /*
     * After login, update the current provider
     * immediately.
     */
    setUser(formattedUser);

    return formattedUser;
  };

  const logout = async () => {
    try {
      await removeToken();

      queryClient.clear();

      setUser(null);
    } catch (error) {
      console.error(
        "[Auth] Logout error:",
        error
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
