// services/clockApi.ts
import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const API = axios.create({
  baseURL: "https://clock-service-1.onrender.com",
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
    console.log("API ERROR:", error?.response?.data);

    if (error.response?.status === 401) {
      await removeToken();
    }

    return Promise.reject(error);
  }
);

export default API;
