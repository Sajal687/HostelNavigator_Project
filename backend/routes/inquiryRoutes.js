const express = require("express");
const { createInquiry, getOwnerInquiries, updateInquiryStatus } = require("../controllers/inquiryController");
const { authenticate, optionalAuthenticate, requireRole } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// Public form that emails owners, so keep it tight per IP to stop spam.
const inquiryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.INQUIRY_RATE_LIMIT) || 5,
  message: "You've sent several inquiries recently. Please wait a few minutes and try again.",
});

router.post("/api/hostels/:id/inquiries", inquiryLimiter, optionalAuthenticate, createInquiry);
router.get("/api/owner/inquiries", authenticate, requireRole("hostelOwner"), getOwnerInquiries);
router.patch("/api/owner/inquiries/:inquiryId", authenticate, requireRole("hostelOwner"), updateInquiryStatus);

module.exports = router;
