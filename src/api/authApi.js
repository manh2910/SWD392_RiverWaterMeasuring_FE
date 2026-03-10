import axios from "axios";

/*const BASE_URL = "https://swdriverapi.onrender.com/api/v1";*/
const BASE_URL = "/api/v1";

const AUTH_LOGIN_PATHS = ["/auth/login", "/auth/signin", "/users/login"];
const AUTH_REGISTER_PATHS = ["/auth/register", "/auth/signup", "/users/register"];

const callFirstAvailablePath = async (paths, payload) => {
  let lastError;

  for (const path of paths) {
    try {
      const res = await axios.post(`${BASE_URL}${path}`, payload);
      return res.data;
    } catch (error) {
      // Try next known auth endpoint to be resilient with backend naming.
      if (error?.response?.status !== 404) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new Error("No auth endpoint is available");
};

export const loginApi = async (data) => {
  return callFirstAvailablePath(AUTH_LOGIN_PATHS, data);
};

export const registerApi = async (data) => {
  return callFirstAvailablePath(AUTH_REGISTER_PATHS, data);
};
