const mongoose = require("mongoose");
const { Hostel } = require("../models/hostelModel");
const { Review } = require("../models/reviewModel");
const { Inquiry } = require("../models/inquiryModel");
const { recomputeHostelRating } = require("../services/ratings");

const HOSTEL_STATUSES = ["draft", "published", "archived"];
const REVIEW_STATUSES = ["pending", "approved", "rejected"];
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));
const pageParams = (query, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [hostels, unverified, pendingReviews, openInquiries] = await Promise.all([
      Hostel.countDocuments({}),
      Hostel.countDocuments({ isVerified: { $ne: true }, status: { $ne: "archived" } }),
      Review.countDocuments({ status: "pending" }),
      Inquiry.countDocuments({ status: "new" }),
    ]);
    res.status(200).json({ message: "Stats", data: { hostels, unverified, pendingReviews, openInquiries } });
  } catch (error) {
    console.log(`Admin stats failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/admin/hostels?verified=true|false&status=&page&limit
const listHostels = async (req, res) => {
  const { verified, status } = req.query;
  if (status && !HOSTEL_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${HOSTEL_STATUSES.join(", ")}` });
  }
  const filter = {};
  if (verified === "true") filter.isVerified = true;
  if (verified === "false") filter.isVerified = { $ne: true };
  if (status) filter.status = status === "published" ? { $in: ["published", null] } : status;
  const { page, limit, skip } = pageParams(req.query);

  try {
    const [hostels, total] = await Promise.all([
      Hostel.find(filter)
        .select("hostel_name hostel_address hostel_rent hostel_gender_type owner_name owner_email owner_phone_number status isVerified has_vacancy hostel_rating review_count createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Hostel.countDocuments(filter),
    ]);
    res.status(200).json({
      message: "Hostels fetched",
      data: hostels,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.log(`Admin hostel list failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /api/admin/hostels/:id  { isVerified?, status? }
const updateHostel = async (req, res) => {
  const { id } = req.params;
  const { isVerified, status } = req.body || {};
  if (!isObjectId(id)) return res.status(400).json({ message: "Invalid hostel id" });
  const update = {};
  if (isVerified !== undefined) {
    if (typeof isVerified !== "boolean") return res.status(400).json({ message: "isVerified must be true or false" });
    update.isVerified = isVerified;
  }
  if (status !== undefined) {
    if (!HOSTEL_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${HOSTEL_STATUSES.join(", ")}` });
    }
    update.status = status;
  }
  if (!Object.keys(update).length) return res.status(400).json({ message: "Nothing to update" });

  try {
    const hostel = await Hostel.findByIdAndUpdate(id, { $set: update }, {
      new: true,
      projection: { hostel_name: 1, status: 1, isVerified: 1 },
    });
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    res.status(200).json({ message: "Hostel updated", data: hostel });
  } catch (error) {
    console.log(`Admin hostel update failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/admin/reviews?status=pending|approved|rejected&page&limit
const listReviews = async (req, res) => {
  const status = req.query.status || "pending";
  if (!REVIEW_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${REVIEW_STATUSES.join(", ")}` });
  }
  const { page, limit, skip } = pageParams(req.query);
  try {
    const [reviews, total] = await Promise.all([
      Review.find({ status })
        .sort({ createdAt: status === "pending" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("hostel", "hostel_name")
        .populate("user", "name")
        .lean(),
      Review.countDocuments({ status }),
    ]);
    res.status(200).json({
      message: "Reviews fetched",
      data: reviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        isVerifiedStay: review.isVerifiedStay,
        createdAt: review.createdAt,
        hostelId: review.hostel?._id,
        hostelName: review.hostel?.hostel_name || "Deleted hostel",
        reviewerName: review.user?.name || "Deleted user",
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.log(`Admin review list failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /api/admin/reviews/:id  { status: "approved" | "rejected" | "pending" }
const moderateReview = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!isObjectId(id)) return res.status(400).json({ message: "Invalid review id" });
  if (!REVIEW_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${REVIEW_STATUSES.join(", ")}` });
  }
  try {
    const review = await Review.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    const rating = await recomputeHostelRating(review.hostel);
    res.status(200).json({ message: "Review updated", data: { _id: review._id, status: review.status, ...rating } });
  } catch (error) {
    console.log(`Review moderation failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getStats, listHostels, updateHostel, listReviews, moderateReview };
