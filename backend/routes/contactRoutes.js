const express = require("express");
const { contactStatus, sendContactMessage } = require("../controllers/contactController");
const { createRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// Public form that emails the support inbox; keep it tight per IP.
const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.CONTACT_RATE_LIMIT) || 3,
  message: "You've sent a few messages already. Please wait a few minutes before sending another.",
});

router.get("/api/contact/status", contactStatus);
router.post("/api/contact", contactLimiter, sendContactMessage);

module.exports = router;
