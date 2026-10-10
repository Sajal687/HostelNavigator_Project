// Backend base URL comes from REACT_APP_API_URL (see .env.example).
// Fallbacks keep existing local and Netlify builds working if the variable is unset.
const DEFAULT_URL =
  process.env.NODE_ENV === "production"
    ? "https://hostelnavigatorbackend.onrender.com"
    : "http://localhost:8080";

export const BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_URL).replace(/\/+$/, "");
