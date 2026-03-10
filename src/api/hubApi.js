import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

export const getHubs = async () => {
  const res = await axios.get(`${BASE_URL}/hubs`);
  return res.data;
};

export const createHub = async (data) => {
  const res = await axios.post(`${BASE_URL}/hubs`, data);
  return res.data;
};

export const updateHub = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/hubs/${id}`, data);
  return res.data;
};

export const patchHub = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/hubs/${id}`, data);
  return res.data;
};

export const deleteHub = async (id) => {
  const res = await axios.delete(`${BASE_URL}/hubs/${id}`);
  return res.data;
};
