import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1/alert-settings/me";

export const getAlerts = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  const res = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};