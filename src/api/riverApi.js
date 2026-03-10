import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

// GET all rivers
export const getRivers = async () => {
  const res = await axios.get(`${BASE_URL}/rivers`);
  return res.data;
};

// CREATE river
export const createRiver = async (data) => {
  const res = await axios.post(`${BASE_URL}/rivers`, data);
  return res.data;
};

// UPDATE river
export const updateRiver = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/rivers/${id}`, data);
  return res.data;
};

// PATCH river
export const patchRiver = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/rivers/${id}`, data);
  return res.data;
};

// DELETE river
export const deleteRiver = async (id) => {
  const res = await axios.delete(`${BASE_URL}/rivers/${id}`);
  return res.data;
};
