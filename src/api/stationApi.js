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

/** Chuẩn hóa response thành mảng trạm (hỗ trợ nhiều format backend) */
function toStationList(data) {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

/** GET /stations - Lấy danh sách trạm đo (luôn trả về mảng) */
export const getStations = async () => {
  const res = await api.get("/stations");
  return toStationList(res.data);
};

/** GET /stations/{id} - Lấy chi tiết một trạm */
export const getStationDetail = async (id) => {
  const res = await api.get(`/stations/${id}`);
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