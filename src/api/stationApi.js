import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

// GET all stations
export const getStations = async () => {
  const res = await axios.get(`${BASE_URL}/stations`);
  return res.data;
};

// CREATE station
export const createStation = async (data) => {
  const res = await axios.post(`${BASE_URL}/stations`, data);
  return res.data;
};

// UPDATE station
export const updateStation = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/stations/${id}`, data);
  return res.data;
};

// PATCH station
export const patchStation = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/stations/${id}`, data);
  return res.data;
};

// DELETE station
export const deleteStation = async (id) => {
  const res = await axios.delete(`${BASE_URL}/stations/${id}`);
  return res.data;
};
