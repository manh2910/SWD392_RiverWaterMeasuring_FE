import axios from "axios";

/* ALERT SETTINGS BASE */
const BASE_URL = "https://swdriverapi.onrender.com/api/v1/alert-settings";

/* ALERT SEND BASE */
const ALERT_BASE = "https://swdriverapi.onrender.com/api/v1/alerts";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/* ================= ALERT SETTINGS ================= */

export const getMyAlertSettings = async () => {
  const res = await axios.get(`${BASE_URL}/me`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const createAlertSetting = async (data) => {
  const res = await axios.post(BASE_URL, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const updateAlertSetting = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const deleteAlertSetting = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

/* ================= SEND ALERT ================= */

export const sendAlert = async (data) => {
  const res = await axios.post(`${ALERT_BASE}/send`, data, {
    headers: authHeaders(),
  });

  return res.data;
};

/* BACKWARD COMPATIBLE */
export const getAlerts = getMyAlertSettings;