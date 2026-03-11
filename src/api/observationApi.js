import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1/observations";*/
const BASE_URL = "/api/v1/observations";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getLatestObservations = async (stationId) => {
  const res = await axios.get(`${BASE_URL}/stations/${stationId}/latest`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const getObservationHistory = async (stationId, params = {}) => {
  const res = await axios.get(`${BASE_URL}/stations/${stationId}/history`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
};

export const getRiverStatus = async (riverId) => {
  const res = await axios.get(`${BASE_URL}/rivers/${riverId}/status`, {
    headers: authHeaders(),
  });
  return res.data;
};
