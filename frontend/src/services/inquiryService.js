import axios from "axios";
import { BASE_URL } from "./helper";

// { student_name, email, phone?, message } -> success message
export const sendInquiry = async (hostelId, inquiry) => {
  const response = await axios.post(`${BASE_URL}/api/hostels/${hostelId}/inquiries`, inquiry);
  return response.data.message;
};

// -> { inquiries, counts: { new, contacted, closed } }
export const getOwnerInquiries = async (status) => {
  const response = await axios.get(`${BASE_URL}/api/owner/inquiries`, { params: status ? { status } : {} });
  return { inquiries: response.data.data, counts: response.data.counts };
};

export const updateInquiryStatus = async (inquiryId, status) => {
  const response = await axios.patch(`${BASE_URL}/api/owner/inquiries/${inquiryId}`, { status });
  return response.data.data;
};
