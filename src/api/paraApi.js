import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1/parameters";

const getToken = () => localStorage.getItem("token");

// ================= GET ALL PARAMETERS =================

export const getParameters = async () => {
  const res = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.data;
};