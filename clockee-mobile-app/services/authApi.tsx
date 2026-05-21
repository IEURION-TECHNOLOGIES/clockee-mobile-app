import { authEmitter } from "@/utils/authEmitter";
import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const API = axios.create({
  baseURL: "https://clockee-auth-qple.onrender.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
API.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("⚠️ Unauthorized — Logging out");

      await removeToken();

      // 🔥 THIS WAS MISSING
      authEmitter.emit("logout");
    }

    return Promise.reject(error);
  }
);

export default API;


