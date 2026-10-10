import axios from "axios";
import { BASE_URL } from "./helper";

export const getAdminStats = async () => {
  const response = await axios.get(`${BASE_URL}/api/admin/stats`);
  return response.data.data;
};

// filters: { verified?: "true" | "false", status?, page? }
export const getAdminHostels = async (filters = {}) => {
  const response = await axios.get(`${BASE_URL}/api/admin/hostels`, { params: filters });
  return { hostels: response.data.data, pagination: response.data.pagination };
};

// changes: { isVerified?, status? }
export const updateAdminHostel = async (hostelId, changes) => {
  const response = await axios.patch(`${BASE_URL}/api/admin/hostels/${hostelId}`, changes);
  return response.data.data;
};

export const getAdminReviews = async (status = "pending", page = 1) => {
  const response = await axios.get(`${BASE_URL}/api/admin/reviews`, { params: { status, page } });
  return { reviews: response.data.data, pagination: response.data.pagination };
};

export const moderateReview = async (reviewId, status) => {
  const response = await axios.patch(`${BASE_URL}/api/admin/reviews/${reviewId}`, { status });
  return response.data.data;
};
