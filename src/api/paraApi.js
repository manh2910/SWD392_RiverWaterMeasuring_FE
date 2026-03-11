import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1/parameters";*/
const BASE_URL = "/api/v1/parameters";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ================= GET ALL PARAMETERS =================
export const getParameters = async () => {
  const res = await axios.get(BASE_URL, {
    headers: authHeaders(),
  });

  return res.data;
};

// ================= CREATE PARAMETER =================
export const createParameter = async (data) => {
  const res = await axios.post(BASE_URL, data, {
    headers: authHeaders(),
  });

  return res.data;
};

// ================= UPDATE PARAMETER =================
export const updateParameter = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: authHeaders(),
  });

  return res.data;
};

// ================= DELETE PARAMETER =================
export const deleteParameter = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeaders(),
  });

  return res.data;
};