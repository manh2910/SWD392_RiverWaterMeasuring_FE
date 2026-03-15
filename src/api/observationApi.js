import axios from "axios";

// Base đúng theo Swagger: GET /api/v1/observations, GET /api/v1/observations/stations/{stationId}/history, ...
const BASE_URL = "https://swdriverapi.onrender.com/api/v1/observations";
// Path segment: Swagger là "stations". Nếu backend dùng "station" (số ít) thì đổi thành "station".
const STATIONS_SEGMENT = "stations";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/** GET /api/v1/observations/stations/{stationId}/latest */
export const getLatestObservations = async (stationId) => {
  const res = await axios.get(`${BASE_URL}/${STATIONS_SEGMENT}/${stationId}/latest`, {
    headers: authHeaders(),
  });
  return res.data;
};

/** GET /api/v1/observations/stations/{stationId}/history - params: startDate, endDate, parameterCode */
export const getObservationHistory = async (stationId, params = {}) => {
  const res = await axios.get(`${BASE_URL}/${STATIONS_SEGMENT}/${stationId}/history`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
};

/** GET /observations - list with filters (stationId, startDate, endDate, parameterCode, page, limit...) */
export const getObservations = async (params = {}) => {
  const res = await axios.get(BASE_URL, {
    headers: authHeaders(),
    params,
  });
  return res.data;
};

/** PUT /observations/{id} - update observation */
export const updateObservation = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

/** DELETE /observations/{id} */
export const deleteObservation = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

/** PATCH /observations/{id}/flag - update quality flag */
export const updateObservationFlag = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/${id}/flag`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

/** GET /observations/rivers/{riverId}/status */
export const getRiverStatus = async (riverId) => {
  const res = await axios.get(`${BASE_URL}/rivers/${riverId}/status`, {
    headers: authHeaders(),
  });
  return res.data;
};
