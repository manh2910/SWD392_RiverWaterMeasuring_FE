import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1/sensors";*/
const BASE_URL = "/api/v1/sensors";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getSensorsByHub = async (hubId) => {
  const res = await axios.get(`${BASE_URL}?hubId=${hubId}`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const createSensorByHub = async (data) => {
  const res = await axios.post(BASE_URL, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const updateSensor = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const deleteSensor = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};
