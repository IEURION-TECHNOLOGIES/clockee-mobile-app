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

import {
  saveUser,
  getSavedUser,
  removeSavedUser,
} from "@/utils/authStorage";


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

        const splashStartTime =
          Date.now();


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
             
             GET SAVED USER
          ================================================= */

          const savedUser =
            await getSavedUser();


          /* =================================================
             RESTORE SAVED USER
             
             This allows the user to remain authenticated
             even if the phone is temporarily offline.
          ================================================= */

          if (
            savedUser &&
            mounted
          ) {

            console.log(
              "[AuthProvider] Restoring saved user:",
              {
                id:
                  savedUser?.id,

                name:
                  savedUser?.name,

                role:
                  savedUser?.role,

                dashboardType:
                  savedUser?.dashboardType,

                branchId:
                  savedUser?.branchId,
              }
            );


            setUser(
              savedUser
            );
          }


          /* =================================================
             REFRESH PROFILE FROM SERVER
          ================================================= */

          try {

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


            /* =============================================
               VALID PROFILE
            ============================================= */

            if (userData) {

              const formattedUser =
                formatUserData(
                  userData
                );


              if (!formattedUser) {
                throw new Error(
                  "Unable to format authenticated user"
                );
              }


              /*
               * Save the newest user information locally.
               */
              await saveUser(
                formattedUser
              );


              if (!mounted) {
                return;
              }


              setUser(
                formattedUser
              );


              console.log(
                "[AuthProvider] Authenticated user restored:",
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

            } else {

              /*
               * Profile request succeeded but returned
               * no usable user.
               *
               * Do NOT automatically delete the token here.
               *
               * If a saved user exists, keep the session.
               */

              console.warn(
                "[AuthProvider] Profile returned no user - keeping saved session"
              );


              if (
                savedUser &&
                mounted
              ) {

                setUser(
                  savedUser
                );

              }

            }


          } catch (profileError: any) {

            const status =
              profileError?.response?.status;


            console.error(
              "[AuthProvider] Profile refresh failed:",
              status,
              profileError?.response?.data ||
                profileError?.message ||
                profileError
            );


            /* =============================================
               REAL AUTHENTICATION FAILURE
               
               Only 401 removes the session.
            ============================================= */

            if (
              status === 401
            ) {

              console.log(
                "[AuthProvider] Token is unauthorized - clearing session"
              );


              try {

                await removeToken();

                await removeSavedUser();

              } catch (removeError) {

                console.error(
                  "[AuthProvider] Failed clearing invalid session:",
                  removeError
                );
              }


              if (!mounted) {
                return;
              }


              setUser(null);


            } else {

              /* ===========================================
                 NETWORK / SERVER / TIMEOUT ERROR
                 
                 KEEP USER LOGGED IN.
              =========================================== */

              console.log(
                "[AuthProvider] Server/network problem - keeping saved session"
              );


              if (
                savedUser &&
                mounted
              ) {

                setUser(
                  savedUser
                );
              }
            }
          }


        } catch (error: any) {

          console.error(
            "[AuthProvider] Auth initialization error:",
            error?.response?.status,
            error?.response?.data ||
              error?.message ||
              error
          );


          /*
           * Do not automatically log the user out for
           * unexpected startup errors.
           *
           * The saved token/user remain intact.
           */

          if (!mounted) {
            return;
          }


          const savedUser =
            await getSavedUser();


          if (savedUser) {

            console.log(
              "[AuthProvider] Unexpected startup error - restoring saved session"
            );


            setUser(
              savedUser
            );

          } else {

            setUser(null);
          }


        } finally {

          if (!mounted) {
            return;
          }


          /* ===============================================
             AUTH INITIALIZATION COMPLETE
          =============================================== */

          const elapsed =
            Date.now() -
            splashStartTime;


          const remainingTime =
            Math.max(
              0,
              3000 - elapsed
            );


          if (
            remainingTime > 0
          ) {

            await new Promise<void>(
              (resolve) => {

                setTimeout(
                  resolve,
                  remainingTime
                );
              }
            );
          }


          if (!mounted) {
            return;
          }


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


      if (!cleanUser) {

        throw new Error(
          "Invalid user data"
        );
      }


      /* ===============================================
         SAVE TOKEN
         
         SecureStore persists this across:
         - app close
         - app reopen
         - phone restart
         - phone power off/on
      =============================================== */

      await saveToken(
        token
      );


      /* ===============================================
         SAVE USER
         
         Used to restore the authenticated UI even
         when the phone is temporarily offline.
      =============================================== */

      await saveUser(
        cleanUser
      );


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

          branchId:
            cleanUser?.branchId,
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


      /* ===============================================
         REMOVE AUTH TOKEN
      =============================================== */

      await removeToken();


      /* ===============================================
         REMOVE SAVED USER
      =============================================== */

      await removeSavedUser();


      /* ===============================================
         CLEAR CACHED APPLICATION DATA
      =============================================== */

      queryClient.clear();


      /* ===============================================
         REMOVE CURRENT AUTHENTICATED USER
      =============================================== */

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
}
