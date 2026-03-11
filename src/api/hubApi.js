import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== ADD TOKEN =====
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===== GET ALL HUBS =====
// BE currently has no /hubs list endpoint; flatten hubs from station payload if present.
export const getHubs = async () => {
  const res = await api.get("/stations");
  const stations = Array.isArray(res.data) ? res.data : [];

  return stations.flatMap((station) => {
    const hubs = Array.isArray(station?.hubs) ? station.hubs : [];
    return hubs.map((hub) => ({
      ...hub,
      stationId: hub.stationId ?? station.stationId,
    }));
  });
};

// ===== GET HUB DETAIL =====
export const getHubDetail = async (id) => {
  const res = await api.get(`/hubs/${id}`);
  return res.data;
};

// ===== GET HUB SENSORS =====
export const getHubSensors = async (id) => {
  const res = await api.get(`/hubs/${id}/sensors`);
  return res.data;
};

// ===== CREATE SENSOR =====
export const createSensor = async (hubId, data) => {
  const res = await api.post(`/hubs/${hubId}/sensors`, data);
  return res.data;
};