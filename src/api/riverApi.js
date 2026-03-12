import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1";

/* ===== TOKEN ===== */

const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token found in localStorage");
  }

  return token;
};

/* ===== AXIOS HEADER ===== */

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

/* ================= GET ALL RIVERS ================= */

export const getRivers = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/rivers`, authHeader());
    return res.data;
  } catch (err) {
    console.error("GET RIVERS ERROR:", err);
    throw err;
  }
};

/* ================= GET RIVER DETAIL ================= */

export const getRiverDetail = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/rivers/${id}/detail`, authHeader());

    console.log("RIVER DETAIL API:", res.data); // debug

    return res.data;
  } catch (err) {
    console.error("GET RIVER DETAIL ERROR:", err);
    throw err;
  }
};

/* ================= CREATE RIVER ================= */

export const createRiver = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/rivers`, data, authHeader());
    return res.data;
  } catch (err) {
    console.error("CREATE RIVER ERROR:", err);
    throw err;
  }
};

/* ================= UPDATE RIVER ================= */

export const updateRiver = async (id, data) => {
  try {
    const res = await axios.put(`${BASE_URL}/rivers/${id}`, data, authHeader());
    return res.data;
  } catch (err) {
    console.error("UPDATE RIVER ERROR:", err);
    throw err;
  }
};

/* ================= PATCH RIVER ================= */

export const patchRiver = async (id, data) => {
  try {
    const res = await axios.patch(`${BASE_URL}/rivers/${id}`, data, authHeader());
    return res.data;
  } catch (err) {
    console.error("PATCH RIVER ERROR:", err);
    throw err;
  }
};

/* ================= DELETE RIVER ================= */

export const deleteRiver = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/rivers/${id}`, authHeader());
    return res.data;
  } catch (err) {
    console.error("DELETE RIVER ERROR:", err);
    throw err;
  }
};