import axios from "axios";
import { BASE_URL } from "./helper";

// Drops empty values and joins arrays so the query string stays clean.
const toQueryParams = (filters) =>
  Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0))
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value])
  );

// GET /api/hostels/search -> { data: hostels[], pagination }
export const searchHostels = async (filters) => {
  const response = await axios.get(`${BASE_URL}/api/hostels/search`, { params: toQueryParams(filters) });
  return { hostels: response.data.data, pagination: response.data.pagination };
};

// Public detail view (published listings only, base64 images).
export const getPublicHostel = async (id) => {
  const response = await axios.get(`${BASE_URL}/api/hostels/${id}`);
  return response.data.data;
};

// Owner view (any status), used by the dashboard.
export const getHostelById = async (id) => {
  const response = await axios.get(`${BASE_URL}/hostels/${id}`);
  return response.data.data;
};

export const updateHostel = async (id, changes) => {
  const response = await axios.put(`${BASE_URL}/hostels/${id}`, changes);
  return response.data.data;
};
