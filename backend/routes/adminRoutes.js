const express = require("express");
const { getStats, listHostels, updateHostel, listReviews, moderateReview } = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const adminOnly = [authenticate, requireRole("admin")];

router.get("/api/admin/stats", adminOnly, getStats);
router.get("/api/admin/hostels", adminOnly, listHostels);
router.patch("/api/admin/hostels/:id", adminOnly, updateHostel);
router.get("/api/admin/reviews", adminOnly, listReviews);
router.patch("/api/admin/reviews/:id", adminOnly, moderateReview);

module.exports = router;
