// Reads the logged-in user from the stored JWT. Returns null when logged out or expired.
// (The backend still verifies every token; this is only for UI decisions.)
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") return null;
    const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return { id: payload.id, userType: payload.userType, userName: payload.userName };
  } catch (error) {
    return null;
  }
};
