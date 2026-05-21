import API from "./authApi";

/* =============================================
   AUTHENTICATION & AUTHORIZATION API CALLS
   ============================================= */

// ==================== REGISTRATION ====================
export const registerUser = (data: any) => 
  API.post("/auth/register", data);

export const registerVisitor = (data: any) => 
  API.post("/auth/visitor/register", data);

export const registerWithInvite = (data: any) => 
  API.post("/auth/register/invite", data);

export const registerPublicInvite = (data: any) => 
  API.post("/auth/register/public", data);

export const registerViaQr = (token: string, data: any) => 
  API.post(`/auth/register/qr/${token}`, data);

// ==================== LOGIN & PASSWORD ====================
export const loginUser = (data: any) => 
  API.post("/auth/login", data);

export const forgotPassword = (email: string) => 
  API.post("/auth/forgot-password", { email });

export const resetPassword = (token: string, data: any) => 
  API.post(`/auth/reset-password/${token}`, data);

// ==================== EMAIL & ACCOUNT ====================
export const changeEmail = (data: any) => 
  API.post("/auth/change-email", data);     // Fixed: was pointing to wrong endpoint

export const updateProfile = (data: any) => 
  API.put("/user/me", data);

export const changePassword = (data: any) => 
  API.patch("/user/change-password", data);

export const getProfile = () => 
  API.get("/user/me");

// export const verifyToken = () => 
//   API.get("/auth/verify");

export const logOutUser = () => 
  API.post("/auth/logout");

// ==================== BACKUP CODES ====================
export const generateBackupCodes = () => 
  API.post("/auth/backup-codes/generate");

export const useBackupCode = (data: any) => 
  API.post("/auth/backup-codes/use", data);

/* =============================================
   OPTIONAL: Add Type Definitions (Recommended)
   ============================================= */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  // add other fields as needed
}

export interface ResetPasswordData {
  password: string;
  confirmPassword?: string;
}

export interface ChangeEmailData {
  email: string;
  currentPassword?: string;
}

