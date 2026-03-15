import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ================== AUTO ADD TOKEN ==================
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ================== LOGIN ==================
export const loginApi = async (data) => {
  try {

    const res = await api.post("/auth/login", data);
    const result = res.data;

    console.log("LOGIN RESPONSE:", result);

    // LƯU TOKEN
    if (result?.token) {
      localStorage.setItem("token", result.token);
    }

    return result;

  } catch (error) {

    console.error("LOGIN ERROR:", error.response?.data || error);

    throw error.response?.data || error;
  }
};


// ================== REGISTER ==================
export const registerApi = async (data) => {
  try {

    const res = await api.post("/auth/register", data);
    return res.data;

  } catch (error) {

    console.error("REGISTER ERROR:", error.response?.data || error);

    throw error.response?.data || error;
  }
};


// ================== LOGOUT ==================
export const logoutApi = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userEmail");
};