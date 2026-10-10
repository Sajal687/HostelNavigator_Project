const express = require("express");
const { getHostelReviews, createReview, getOwnerReviews, replyToReview } = require("../controllers/reviewController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/api/hostels/:id/reviews", getHostelReviews);
router.post("/api/hostels/:id/reviews", authenticate, requireRole("hostelUser"), createReview);
router.get("/api/owner/reviews", authenticate, requireRole("hostelOwner"), getOwnerReviews);
router.put("/api/reviews/:reviewId/reply", authenticate, requireRole("hostelOwner"), replyToReview);

module.exports = router;
