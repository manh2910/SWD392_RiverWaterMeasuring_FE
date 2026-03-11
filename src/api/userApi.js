import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1/users";*/
const BASE_URL = "/api/v1/users";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getMyProfile = async () => {
  const res = await axios.get(`${BASE_URL}/me`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const getUsers = async () => {
  const res = await axios.get(BASE_URL, {
    headers: authHeaders(),
  });
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await axios.put(`${BASE_URL}/me`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const changeMyPassword = async (data) => {
  const res = await axios.put(`${BASE_URL}/me/password`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const updateUserRole = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};
