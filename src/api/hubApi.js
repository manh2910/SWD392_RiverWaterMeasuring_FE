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

// ================= HUB API =================

// GET ALL HUBS
export const getHubs = async () => {
  const res = await api.get("/hubs");
  return res.data;
};

// GET HUB DETAIL
export const getHubDetail = async (id) => {
  const res = await api.get(`/hubs/${id}`);
  return res.data;
};

// UPDATE HUB
export const updateHub = async (id, data) => {
  const res = await api.put(`/hubs/${id}`, data);
  return res.data;
};

// DELETE HUB
export const deleteHub = async (id) => {
  const res = await api.delete(`/hubs/${id}`);
  return res.data;
};

// REGENERATE SECRET KEY
export const regenerateSecretKey = async (id) => {
  const res = await api.post(`/hubs/${id}/secret-key`);
  return res.data;
};

export default api;