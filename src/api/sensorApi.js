import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1";

// Dùng axios instance + interceptor để gắn token nhất quán như phần còn lại của FE.
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    const authHeaderValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    // Gắn header chắc chắn vào config.headers (một số trường hợp AxiosHeaders có thể undefined)
    config.headers = { ...(config.headers ?? {}), Authorization: authHeaderValue };
    if (config.headers?.common) {
      config.headers.common.Authorization = authHeaderValue;
    }
  }
  return config;
});

export const getSensorsByHub = async (hubId) => {
  const res = await api.get("/sensors", {
    params: { hubId },
  });
  return res.data;
};

export const createSensorByHub = async (data) => {
  const res = await api.post("/sensors", data);
  return res.data;
};

export const updateSensor = async (id, data) => {
  const res = await api.put(`/sensors/${id}`, data);
  return res.data;
};

export const deleteSensor = async (id) => {
  const res = await api.delete(`/sensors/${id}`);
  return res.data;
};
