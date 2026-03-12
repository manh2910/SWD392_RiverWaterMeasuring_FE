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
  const res = await axios.get(BASE_URL, {
    headers: authHeaders(),
  });
  return res.data;
};

export const resolveAlert = async (alertId) => {
  const res = await axios.put(`${BASE_URL}/${alertId}/resolve`, {}, {
    headers: authHeaders(),
  });
  return res.data;
};
