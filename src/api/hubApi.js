import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1";

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
export const getHubs = async () => {
  const res = await api.get("/hubs");
  return res.data;
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