import axios from "axios";

const BASE_URL = "https://swdriverapi.onrender.com/api/v1/data-packages";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * GET /api/v1/data-packages - paginated list
 * @param {Object} params - { page, limit, ... }
 */
export const getDataPackages = async (params = {}) => {
  const res = await axios.get(BASE_URL, {
    headers: authHeaders(),
    params,
  });
  return res.data;
};

/**
 * GET /api/v1/data-packages/summary
 */
export const getDataPackagesSummary = async () => {
  const res = await axios.get(`${BASE_URL}/summary`, {
    headers: authHeaders(),
  });
  return res.data;
};

/**
 * PUT /api/v1/data-packages/{id}/status - update status
 * @param {string|number} id
 * @param {Object} data - { status: "processed" | "pending" | "error" }
 */
export const updateDataPackageStatus = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}/status`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

/**
 * DELETE /api/v1/data-packages/{id}
 */
export const deleteDataPackage = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};
