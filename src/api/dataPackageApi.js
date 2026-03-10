import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

export const getDataPackages = async () => {
  const res = await axios.get(`${BASE_URL}/data-packages`);
  return res.data;
};

export const createDataPackage = async (data) => {
  const res = await axios.post(`${BASE_URL}/data-packages`, data);
  return res.data;
};

export const updateDataPackage = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/data-packages/${id}`, data);
  return res.data;
};

export const patchDataPackage = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/data-packages/${id}`, data);
  return res.data;
};

export const deleteDataPackage = async (id) => {
  const res = await axios.delete(`${BASE_URL}/data-packages/${id}`);
  return res.data;
};
