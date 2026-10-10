import axios from "axios";
import { BASE_URL } from "./helper";

export const getAiStatus = async () => {
  const response = await axios.get(`${BASE_URL}/api/ai/status`);
  return response.data.data.enabled;
};

// Free text -> { city, minRent, maxRent, gender, roomTypes, facilities, keywords, unmatched }
export const parseSearchQuery = async (query) => {
  const response = await axios.post(`${BASE_URL}/api/ai/search-query`, { query });
  return response.data.data.filters;
};

// -> { summary, generatedAt, cached }
export const summarizeListing = async (hostelId) => {
  const response = await axios.post(`${BASE_URL}/api/ai/summarize-listing`, { hostelId });
  return response.data.data;
};

// messages: [{ role: "user" | "assistant", content }]
export const askConcierge = async (messages, hostelId) => {
  const response = await axios.post(`${BASE_URL}/api/ai/concierge`, {
    messages,
    ...(hostelId ? { hostelId } : {}),
  });
  return response.data.data.reply;
};
