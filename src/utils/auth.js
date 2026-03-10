const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "loggedInUser";

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_USER_KEY));
};

export const setAuthSession = (data, fallbackEmail = "") => {
  const token =
    data?.accessToken ||
    data?.token ||
    data?.jwt ||
    data?.data?.accessToken ||
    data?.data?.token;

  const user =
    data?.email ||
    data?.username ||
    data?.user?.email ||
    data?.data?.email ||
    fallbackEmail;

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, user);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
