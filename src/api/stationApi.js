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

// ================= GET STATIONS =================
export const getStations = async () => {
  const res = await api.get("/stations");
  return res.data;
};

// ================= CREATE STATION =================
export const createStation = async (data) => {
  const res = await api.post("/stations", data);
  return res.data;
};

// ================= UPDATE STATION =================
export const updateStation = async (id, data) => {
  const res = await api.put(`/stations/${id}`, data);
  return res.data;
};

// ================= DELETE STATION =================
export const deleteStation = async (id) => {
  const res = await api.delete(`/stations/${id}`);
  return res.data;
};

// ================= CREATE HUB =================
export const createHub = async (stationId, data) => {
  const res = await api.post(`/stations/${stationId}/hubs`, data);
  return res.data;
};