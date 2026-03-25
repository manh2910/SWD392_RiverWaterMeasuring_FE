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

export const upsertAlertSetting = createAlertSetting;

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

export const getLatestAlerts = async () => {
  try {
    const res = await axios.get(`${ALERT_BASE}/latest`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403 || status === 404) {
      try {
        const dashboardRes = await axios.get(`${ALERT_BASE}/dashboard`, {
          headers: authHeaders(),
        });
        return dashboardRes.data;
      } catch {
        const allRes = await axios.get(`${ALERT_BASE}`, {
          headers: authHeaders(),
        });
        return allRes.data;
      }
    }
    throw err;
  }
};

/* BACKWARD COMPATIBLE */
export const getAlerts = getMyAlertSettings;