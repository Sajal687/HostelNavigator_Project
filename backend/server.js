const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const hostelRoutes = require("./routes/hostelRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const { verifyEmailTransport } = require("./services/email");
const { getJwtSecret } = require("./middleware/auth");
const { standardizeResponse, notFound, errorHandler } = require("./middleware/response");

const port = process.env.PORT || 8080;

// Render terminates TLS at one proxy hop; trust it so req.ip is the real client IP
// (used by the AI rate limiter).
app.set("trust proxy", 1);

// Fail fast on Render if the signing secret is missing instead of issuing forgeable tokens.
getJwtSecret();
if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set - using an insecure development secret");
}

const DEFAULT_ORIGINS = [
  "https://hostelnavigator.online",
  "https://www.hostelnavigator.online",
  "http://localhost:3000",
];
const configuredOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length ? configuredOrigins : DEFAULT_ORIGINS;

app.use(cors({
  // Requests without an Origin header (curl, uptime monitors, server-to-server) are allowed.
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
}));
// Registered before the body parser so malformed-JSON errors get the standard shape too.
app.use(standardizeResponse);
app.use(express.json());


const connnectDB = async () => {
  try {
    // MONGODB_URI is the documented name; MONGO_URI kept for existing deployments.
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    // console.log(process.env)
    await mongoose.connect(uri);
    console.log("We're connected with DB");
    // Wait for index builds (incl. the 2dsphere index) so geo queries never run without them.
    await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
    console.log("Indexes are ready");
  } catch(error) {
    console.log(error)
    console.log("DB not connected");
  }
};

connnectDB();
verifyEmailTransport();

// Lightweight, unauthenticated health check used for uptime pings and cold-start wakeups.
// Intentionally does not query the DB so it responds even while Atlas is reconnecting.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use(hostelRoutes);
app.use(userRoutes);
app.use(bookingRoutes);
app.use(notificationRoutes);
app.use(aiRoutes);
app.use(reviewRoutes);
app.use(inquiryRoutes);
app.use(adminRoutes);
app.use(contactRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App is Listen on PORT ${port}`);
});
