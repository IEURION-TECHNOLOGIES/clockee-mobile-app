// services/api.js
import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const API = axios.create({
  baseURL: "https://clockee-admin-sga2.onrender.com",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* REQUEST INTERCEPTOR */
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

/* RESPONSE INTERCEPTOR */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API ERROR:", error?.response?.data); // 🔥 ADD THIS

    if (error.response?.status === 401) {
      await removeToken();
    }

    return Promise.reject(error);
  }
);


export default API;
