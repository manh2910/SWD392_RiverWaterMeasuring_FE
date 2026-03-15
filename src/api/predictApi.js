import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1/predictions";

const getToken = () => localStorage.getItem("token");

// ================= GET RIVER PREDICTION =================
export const getRiverPrediction = async (riverId) => {
  const res = await axios.get(`${BASE_URL}/rivers/${riverId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.data;
};
