import axios from "axios";
import { BASE_URL } from "./helper";

// Render free-tier services sleep when idle and can take ~30-60s to wake up.
// These interceptors watch requests to our backend on the shared axios instance
// and flag a "cold start" when any of them is still pending after the threshold.
const SLOW_THRESHOLD_MS = 5000;

let pending = 0;
let slowTimer = null;
let isSlow = false;
const listeners = new Set();

const setSlow = (value) => {
  if (isSlow === value) return;
  isSlow = value;
  listeners.forEach((listener) => listener(value));
};

export const subscribeColdStart = (listener) => {
  listeners.add(listener);
  listener(isSlow);
  return () => {
    listeners.delete(listener);
  };
};

const isBackendRequest = (config) =>
  typeof config?.url === "string" && config.url.startsWith(BASE_URL);

const trackStart = (config) => {
  config.__coldStartTracked = true;
  pending++;
  if (!slowTimer) {
    slowTimer = setTimeout(() => setSlow(true), SLOW_THRESHOLD_MS);
  }
};

const trackEnd = (config) => {
  if (!config?.__coldStartTracked) return;
  config.__coldStartTracked = false;
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    clearTimeout(slowTimer);
    slowTimer = null;
    setSlow(false);
  }
};

const getStoredToken = () => {
  try {
    const token = localStorage.getItem("token");
    return token && token !== "undefined" ? token : null;
  } catch (error) {
    return null;
  }
};

axios.interceptors.request.use((config) => {
  if (isBackendRequest(config)) {
    trackStart(config);
    // Attach the session token to every backend call unless the caller set one already.
    const token = getStoredToken();
    if (token && !config.headers.has("authorization")) {
      config.headers.set("authorization", token);
    }
  }
  return config;
});

axios.interceptors.response.use(
  (response) => {
    trackEnd(response.config);
    return response;
  },
  (error) => {
    trackEnd(error.config);
    return Promise.reject(error);
  }
);

// Pulls the user-facing message out of a failed request ({ success: false, error }).
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.response?.data?.error || error?.response?.data?.message || fallback;

// Ping the health endpoint on app load so a sleeping backend starts waking up
// before the user's first real request.
export const warmUpBackend = () =>
  axios.get(`${BASE_URL}/api/health`).catch(() => {});
