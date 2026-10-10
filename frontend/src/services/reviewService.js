import axios from "axios";
import { BASE_URL } from "./helper";

// -> { reviews, summary: { average, count }, pagination }
export const getHostelReviews = async (hostelId, page = 1, limit = 5) => {
  const response = await axios.get(`${BASE_URL}/api/hostels/${hostelId}/reviews`, { params: { page, limit } });
  return { reviews: response.data.data, summary: response.data.summary, pagination: response.data.pagination };
};

// -> { message, data: { status, isVerifiedStay } }
export const createReview = async (hostelId, { rating, comment }) => {
  const response = await axios.post(`${BASE_URL}/api/hostels/${hostelId}/reviews`, { rating, comment });
  return { message: response.data.message, ...response.data.data };
};

export const getOwnerReviews = async () => {
  const response = await axios.get(`${BASE_URL}/api/owner/reviews`);
  return response.data.data;
};

export const replyToReview = async (reviewId, text) => {
  const response = await axios.put(`${BASE_URL}/api/reviews/${reviewId}/reply`, { text });
  return response.data.data.ownerReply;
};
