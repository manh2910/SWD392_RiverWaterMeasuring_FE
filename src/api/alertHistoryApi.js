import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1/alerts";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getAlertHistory = async () => {
  try {
    const res = await axios.get(BASE_URL, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    // Một số tài khoản user không được quyền /alerts, fallback về endpoint dashboard
    if (status === 401 || status === 403 || status === 404) {
      const fallback = await axios.get(`${BASE_URL}/dashboard`, {
        headers: authHeaders(),
      });
      return fallback.data;
    }
    throw err;
  }
};

export const resolveAlert = async (alertId) => {
  const res = await axios.put(`${BASE_URL}/${alertId}/resolve`, {}, {
    headers: authHeaders(),
  });
  return res.data;
};
