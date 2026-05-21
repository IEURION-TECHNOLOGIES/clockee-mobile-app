// services/clockService.ts
import API from "./clockApi";
import { getToken } from "../utils/token";

export const clockIn = async (lat: number, lng: number) => {
  const token = await getToken();

  return API.post("/clock/clock", {
    actionType: "clock-in",
    mode: "silent",
    gps: {
      lat: Number(lat.toFixed(3)),   // 3 decimal places
      lng: Number(lng.toFixed(3)),
    },
    token,
  });
};


export const clockOut = async (lat: number, lng: number) => {
  const token = await getToken();

  return API.post("/clock/clock", {
    actionType: "clock-out",
    mode: "silent",
    gps: {
      lat: Number(lat.toFixed(3)),   // 3 decimal places
      lng: Number(lng.toFixed(3)),
    },
    token,
  });
};


export const getClockHistory = async () => {
  return API.get("/clock/history");
};

export const getCurrentClockStatus = async () => {
  return API.get("/clock/status");
}

export const getClockSummary = async () => {
  return API.get("/clock/staff/summary");
}

export const getSchedule = async () => {
  return API.get("/clock/shedule");
}


export const syncOfflineLogs = (data: any) =>
  API.post("/clock/sync", data);
