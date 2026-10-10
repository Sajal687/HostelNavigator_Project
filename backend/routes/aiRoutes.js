const express = require("express");
const { searchQuery, summarizeListing, concierge, status } = require("../controllers/aiController");
const { createRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// AI routes are public (students browse without logging in), so cap per-IP usage
// to protect the Anthropic bill. AI_RATE_LIMIT = requests per 15 minutes.
const aiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT) || 30,
  message: "Too many AI requests. Please wait a few minutes and try again.",
});

router.get("/api/ai/status", status);
router.post("/api/ai/search-query", aiLimiter, searchQuery);
router.post("/api/ai/summarize-listing", aiLimiter, summarizeListing);
router.post("/api/ai/concierge", aiLimiter, concierge);

module.exports = router;
