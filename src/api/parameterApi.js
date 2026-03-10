import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

export const getParameters = async () => {
  const res = await axios.get(`${BASE_URL}/parameters`);
  return res.data;
};

export const createParameter = async (data) => {
  const res = await axios.post(`${BASE_URL}/parameters`, data);
  return res.data;
};

export const updateParameter = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/parameters/${id}`, data);
  return res.data;
};

export const patchParameter = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/parameters/${id}`, data);
  return res.data;
};

export const deleteParameter = async (id) => {
  const res = await axios.delete(`${BASE_URL}/parameters/${id}`);
  return res.data;
};
