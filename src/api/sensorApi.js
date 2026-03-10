import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

export const getSensors = async () => {
  const res = await axios.get(`${BASE_URL}/sensors`);
  return res.data;
};

export const createSensor = async (data) => {
  const res = await axios.post(`${BASE_URL}/sensors`, data);
  return res.data;
};

export const updateSensor = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/sensors/${id}`, data);
  return res.data;
};

export const patchSensor = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/sensors/${id}`, data);
  return res.data;
};

export const deleteSensor = async (id) => {
  const res = await axios.delete(`${BASE_URL}/sensors/${id}`);
  return res.data;
};
