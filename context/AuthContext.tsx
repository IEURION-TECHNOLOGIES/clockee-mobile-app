import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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

  isReady: boolean;

  login: (
    email: string,
    password: string,
    deviceInfo: string
  ) => Promise<any>;

  logout: () => Promise<void>;
}


const AuthContext =
  createContext<AuthContextType | null>(null);


export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const [user, setUser] =
    useState<any | null>(null);

  /**
   * General loading state.
   *
   * Used for login/logout operations too.
   */
  const [loading, setLoading] =
    useState(true);

  /**
   * Initial authentication check completed.
   */
  const [initialized, setInitialized] =
    useState(false);

  /**
   * ONLY true during initial startup authentication.
   */
  const [isInitializing, setIsInitializing] =
    useState(true);

  /**
   * Main startup-ready flag.
   */
  const [isReady, setIsReady] =
    useState(false);

  const queryClient =
    useQueryClient();


  /* =========================================================
     EXTRACT USER
  ========================================================= */

  const extractUserData = (
    response: any
  ) => {

    if (!response?.data) {
      return null;
    }

    return (
      response.data.user ||
      response.data.data ||
      response.data
    );
  };


  /* =========================================================
     FORMAT USER
  ========================================================= */

  const formatUserData = (
    userData: any,
    session?: any
  ) => {

    if (!userData) {
      return null;
    }

    const rawRoles =
      userData.role;

    const roles =
      Array.isArray(rawRoles)
        ? rawRoles
        : rawRoles
          ? [rawRoles]
          : [];


    let primaryRole =
      "staff";


    if (
      roles.includes(
        "super_admin"
      )
    ) {

      primaryRole =
        "super_admin";

    } else if (
      roles.includes("admin")
    ) {

      primaryRole =
        "admin";

    } else if (
      roles.includes("owner")
    ) {

      primaryRole =
        "owner";
    }


    return {
      ...userData,

      roles,

      role: primaryRole,

      session:
        session ||
        userData.session ||
        userData.activeSession ||
        null,
    };
  };


  /* =========================================================
     INITIAL AUTHENTICATION
     
     RUNS ONCE WHEN APP OPENS.
  ========================================================= */

  useEffect(() => {

    let mounted = true;


    const initializeAuth =
      async () => {
        const splashStartTime = Date.now();

        try {

          setLoading(true);

          setIsInitializing(true);

          setIsReady(false);


          /* =================================================
             GET SAVED TOKEN
          ================================================= */

          const token =
            await getToken();


          console.log(
            "[AuthProvider] Auth init token:",
            token
              ? "exists"
              : "null"
          );


          /* =================================================
             NO TOKEN
          ================================================= */

          if (!token) {

            if (!mounted) {
              return;
            }

            setUser(null);

            console.log(
              "[AuthProvider] No token - user is logged out"
            );

            return;
          }


          /* =================================================
             TOKEN EXISTS
             
             RESTORE USER SESSION
          ================================================= */

          const response =
            await getProfile();


          const userData =
            extractUserData(
              response
            );


          console.log(
            "[AuthProvider] Profile extracted:",
            userData
          );


          if (!mounted) {
            return;
          }


          /* =================================================
             VALID PROFILE
          ================================================= */

          if (userData) {

            const formattedUser =
              formatUserData(
                userData
              );


            console.log(
              "[AuthProvider] Restored authenticated user:",
              {
                id:
                  formattedUser?.id,

                name:
                  formattedUser?.name,

                role:
                  formattedUser?.role,

                dashboardType:
                  formattedUser?.dashboardType,

                branchId:
                  formattedUser?.branchId,
              }
            );


            setUser(
              formattedUser
            );


          } else {

            /* ===============================================
               INVALID TOKEN
            =============================================== */

            console.log(
              "[AuthProvider] Invalid profile - removing token"
            );


            await removeToken();


            if (!mounted) {
              return;
            }


            setUser(null);
          }


        } catch (error: any) {

          console.error(
            "[AuthProvider] Auth initialization error:",
            error?.response?.status,
            error?.response?.data ||
              error?.message ||
              error
          );


          /* ===============================================
             INVALID TOKEN
          =============================================== */

          if (
            error?.response?.status ===
            401
          ) {

            try {

              await removeToken();

            } catch (
              removeError
            ) {

              console.error(
                "[AuthProvider] Failed removing invalid token:",
                removeError
              );
            }
          }


          if (!mounted) {
            return;
          }


          setUser(null);


        } finally {

          if (!mounted) {
            return;
          }


          /* ===============================================
             AUTH INITIALIZATION COMPLETE
          =============================================== */

          const elapsed =
            Date.now() - splashStartTime;

          const remainingTime =
            Math.max(0, 3000 - elapsed);

          if (remainingTime > 0) {
            await new Promise<void>((resolve) => {
              setTimeout(resolve, remainingTime);
            });
          }

          if (!mounted) return;

          setLoading(false);

          setInitialized(true);

          setIsInitializing(false);

          setIsReady(true);


          console.log(
            "[AuthProvider] Authentication initialization complete"
          );
        }
      };


    initializeAuth();


    return () => {
      mounted = false;
    };

  }, []);


  /* =========================================================
     LOGIN
  ========================================================= */

  const login = async (
    email: string,
    password: string,
    deviceInfo: string
  ) => {

    try {

      setLoading(true);


      const response =
        await loginUser({
          email,
          password,
          deviceInfo,
        });


      console.log(
        "[AuthProvider] Login response:",
        response?.data
      );


      const token =
        response?.data?.token;


      const session =
        response?.data?.session;


      const userData =
        extractUserData(
          response
        );


      if (
        !token ||
        !userData
      ) {

        throw new Error(
          "Invalid login response"
        );
      }


      const cleanUser =
        formatUserData(
          userData,
          session
        );


      /* ===============================================
         SAVE TOKEN
      =============================================== */

      await saveToken(token);


      /* ===============================================
         UPDATE USER
      =============================================== */

      setUser(
        cleanUser
      );


      console.log(
        "[AuthProvider] Login successful:",
        {
          id:
            cleanUser?.id,

          name:
            cleanUser?.name,

          role:
            cleanUser?.role,

          dashboardType:
            cleanUser?.dashboardType,
        }
      );


      return cleanUser;


    } finally {

      setLoading(false);

      /**
       * Login is NOT an app restart.
       *
       * Therefore don't show startup splash.
       */
      setInitialized(true);

      setIsReady(true);

      setIsInitializing(false);
    }
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = async () => {

    try {

      setLoading(true);


      await removeToken();


      /**
       * Clear cached application data.
       */
      queryClient.clear();


      /**
       * Remove current authenticated user.
       */
      setUser(null);


      console.log(
        "[AuthProvider] User logged out"
      );


    } catch (error) {

      console.error(
        "[AuthProvider] Logout error:",
        error
      );


    } finally {

      setLoading(false);

      /**
       * IMPORTANT:
       *
       * Logout is NOT startup.
       *
       * Therefore don't show splash.
       */
      setIsInitializing(false);

      setIsReady(true);

      setInitialized(true);
    }
  };


  /* =========================================================
     PROVIDER
  ========================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        isInitializing,
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


/* =========================================================
   USE AUTH
========================================================= */

export const useAuth = () => {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }


  return context;
};
