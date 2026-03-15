import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================== ADD TOKEN ==================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================== HANDLE 401 ==================
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userEmail");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getMyProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await api.put("/users/me", data);
  return res.data;
};

export const changeMyPassword = async (data) => {
  const res = await api.put("/users/me/password", data);
  return res.data;
};

export const updateUserRole = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
