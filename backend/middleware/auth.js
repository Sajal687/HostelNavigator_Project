const jwt = require("jsonwebtoken");

const DEV_FALLBACK_SECRET = "hostelnavigator-dev-only-secret";

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  return DEV_FALLBACK_SECRET;
};

const signToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });

// Accepts either a raw token (what the frontend sends today) or "Bearer <token>".
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = {
      id: decoded.id,
      userType: decoded.userType,
      userName: decoded.userName,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Attaches req.user when a valid token is sent, but never rejects the request.
// For public routes that behave slightly differently for logged-in users.
const optionalAuthenticate = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.replace(/^Bearer\s+/i, "");
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = { id: decoded.id, userType: decoded.userType, userName: decoded.userName };
    } catch (error) {
      // Invalid or expired tokens are treated as anonymous.
    }
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.userType)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// Allows the request only when the token's id matches the given route param.
const requireSelf = (param) => (req, res, next) => {
  if (!req.user || String(req.user.id) !== String(req.params[param])) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

module.exports = {
  getJwtSecret,
  signToken,
  authenticate,
  optionalAuthenticate,
  requireRole,
  requireSelf,
};
