import API from "@/api/baseUrl";

/* ================= GET INSTITUTION SETTINGS ================= */
export const getInstitutionSettings = (institutionId) =>
  API.get(`/institutions/${institutionId}/setting`);

/* ================= UPDATE INSTITUTION SETTINGS ================= */
export const updateInstitutionSettings = (institutionId, data) =>
  API.patch(`/institutions/${institutionId}/setting`, data);

/* ================= UPDATE OFFICE LOCATION ================= */
export const updateOfficeLocation = (institutionId, data) =>
  API.patch(`/institutions/${institutionId}/location`, data);

/* ================= DASHBOARD SUMMARY ================= */
export const getDashboardSummary = () =>
  API.get(`/clock/dashboard/summary`);

