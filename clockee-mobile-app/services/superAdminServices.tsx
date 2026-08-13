import API from "./superAdminApi";

/* ================= REGISTER & CREATE ================= */
export const registerAdmin = (data: any) => API.post("/admin/register", data);

export const createAdmin = (institutionId: string, data: any) =>
  API.post(`/admin/create/${institutionId}/admin`, data);

export const createAdminByOwner = (data: any) =>
  API.post(`/admin/create/admin`, data);

export const createStaff = (institutionId: string, data: any) =>
  API.post(`/admin/institutions/${institutionId}/staff`, data);

export const createStaffByAdmin = (data: any) =>
  API.post(`/admin/institutions/staff`, data);

/* ================= GET USERS ================= */
export const getInstitutions = () => API.get("/admin/institutions");

export const getAdmins = (institutionId: string) =>
  API.get(`/admin/admins`, { params: { institutionId } });

export const getStaffs = () => API.get(`/admin/institution/users`);

export const getStaffByInstitution = (institutionId: string) =>
  API.get("/admin/institution/users", {
    params: { id: institutionId, role: "staff" },
  });

export const getAdminByInstitution = (institutionId: string) =>
  API.get("/admin/institution/users", {
    params: { id: institutionId, role: "admin" },
  });

/* ================= SINGLE USER ================= */
export const getSingleUser = (userId: string) =>
  API.get(`/admin/institution/user/${userId}`);

/* ================= USER ACTIONS ================= */
export const allowRemoteClocking = async (
  userId: string,
  institutionId: string,
  allowed: boolean
) => {
  console.log("🌍 allowRemoteClocking API CALL");
  console.log("UserId:", userId);
  console.log("InstitutionId:", institutionId);
  console.log("Allowed:", allowed);

  try {
    const res = await API.patch(`/admin/users/${userId}/remote-access`, {
      institutionId,
      allowed,
    });

    console.log("✅ Remote Clocking Success:", res.data);
    return res;
  } catch (error: any) {
    console.error("❌ Remote Clocking Failed:");
    console.error("Status:", error.response?.status);
    console.error("Response Data:", error.response?.data);
    console.error("Message:", error.response?.data?.message);
    throw error;
  }
};


export const promoteToAdmin = (userId: string) =>
  API.patch(`/admin/users/${userId}/promote-admin`);

export const demoteToStaff = (userId: string) =>
  API.patch(`/admin/users/${userId}/demote-admin`);

export const deactivateUser = (userId: string) =>
  API.patch(`/admin/users/${userId}/deactivate`);

export const reactivateUser = (userId: string) =>
  API.patch(`/admin/users/${userId}/reactivate`);

export const editUser = (userId: string, data: any) =>
  API.patch(`/admin/users/${userId}/edit`, data);

/* ================= BRANCHES ================= */
export const createBranch = (data: any) =>
  API.post(`/admin/institution/branches`, data);

export const updateBranch = (branchId: string, data: any) =>
  API.patch(`/admin/institution/branches/update/${branchId}`, data);

export const getInstitutionBranches = (institutionId: string) =>
  API.get(`/admin/institution/branches`, { params: { institutionId } });

export const getStaffByBranch = (branchId: string) =>
  API.get(`/admin/institution/branches/${branchId}/staff`);

export const assignStaffToBranch = (
  institutionId: string,
  userId: string,
  branchId: string
) =>
  API.patch(
    `/admin/institution/branches/${institutionId}/assign-user/${userId}`,
    { branchId }
  );

export const assignStaffToBranchByAdmin = (
  institutionId: string,
  userId: string,
  branchId: string
) =>
  API.patch(
    `/admin/institution/branches/${institutionId}/assign-user/${userId}`,
    { branchId }
  );
