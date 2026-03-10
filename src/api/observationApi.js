import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

export const getObservations = async () => {
  const res = await axios.get(`${BASE_URL}/observations`);
  return res.data;
};

export const createObservation = async (data) => {
  const res = await axios.post(`${BASE_URL}/observations`, data);
  return res.data;
};

export const updateObservation = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/observations/${id}`, data);
  return res.data;
};

export const patchObservation = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/observations/${id}`, data);
  return res.data;
};

export const deleteObservation = async (id) => {
  const res = await axios.delete(`${BASE_URL}/observations/${id}`);
  return res.data;
};
