import axios from "axios";
import { BASE_URL } from "./helper";

// -> { enabled, email } - whether the contact form can send, and the support address.
export const getContactStatus = async () => {
  const response = await axios.get(`${BASE_URL}/api/contact/status`);
  return response.data.data;
};

// { name, email, topic, message, website (honeypot) } -> success message
export const sendContactMessage = async (payload) => {
  const response = await axios.post(`${BASE_URL}/api/contact`, payload);
  return response.data.message;
};
