const mongoose = require("mongoose");
const { Review } = require("../models/reviewModel");
const { Hostel } = require("../models/hostelModel");
const { Booking } = require("../models/bookingModel");
const { User } = require("../models/userModel");
const { Notification } = require("../models/notificationModel");
const { recomputeHostelRating } = require("../services/ratings");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const findPublicHostel = (id) =>
  Hostel.findOne({ _id: id, status: { $in: ["published", null] } }).select("_id authUser hostel_name");

// GET /api/hostels/:id/reviews?page&limit - approved reviews, newest first.
const getHostelReviews = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: "Invalid hostel id" });
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5));

  try {
    const hostel = await Hostel.findById(id).select("hostel_rating review_count status");
    if (!hostel || hostel.status === "draft" || hostel.status === "archived") {
      return res.status(404).json({ message: "Hostel not found" });
    }
    const reviews = await Review.find({ hostel: id, status: "approved" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name")
      .lean();

    res.status(200).json({
      message: "Reviews fetched",
      data: reviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        isVerifiedStay: review.isVerifiedStay,
        ownerReply: review.ownerReply?.text ? review.ownerReply : null,
        createdAt: review.createdAt,
        // First name only, to keep reviewers' identities light.
        reviewerName: review.user?.name ? review.user.name.split(" ")[0] : "Student",
      })),
      summary: { average: hostel.hostel_rating, count: hostel.review_count },
      pagination: { page, limit, total: hostel.review_count, totalPages: Math.ceil(hostel.review_count / limit) },
    });
  } catch (error) {
    console.log(`Fetching reviews failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /api/hostels/:id/reviews  { rating, comment }  (students only)
const createReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body || {};
  if (!isObjectId(id)) return res.status(400).json({ message: "Invalid hostel id" });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
  }
  if (typeof comment !== "string" || comment.trim().length < 10 || comment.length > 2000) {
    return res.status(400).json({ message: "Please write a review between 10 and 2000 characters" });
  }

  try {
    const hostel = await findPublicHostel(id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    // Students with an accepted booking here are verified and published immediately;
    // everyone else waits for admin moderation.
    // "accept" is the legacy value stored before booking statuses were validated.
    const acceptedBooking = await Booking.exists({
      user: req.user.id,
      hostel: id,
      status: { $in: ["accepted", "accept"] },
    });
    const review = await Review.create({
      hostel: id,
      user: req.user.id,
      rating,
      comment: comment.trim(),
      isVerifiedStay: Boolean(acceptedBooking),
      status: acceptedBooking ? "approved" : "pending",
    });

    if (review.status === "approved") await recomputeHostelRating(id);

    const reviewer = await User.findById(req.user.id).select("authUser");
    await Notification.create({
      sender: reviewer?.authUser,
      receiver: hostel.authUser,
      message: `New ${rating}-star review for ${hostel.hostel_name}.`,
      markRead: "no",
    });

    res.status(201).json({
      message: review.status === "approved"
        ? "Thanks! Your review is live."
        : "Thanks! Your review will appear after a quick moderation check.",
      data: { _id: review._id, status: review.status, isVerifiedStay: review.isVerifiedStay },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already reviewed this hostel" });
    }
    console.log(`Creating review failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/owner/reviews - every review of the owner's hostel, any status.
const getOwnerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hostel: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "name")
      .lean();
    res.status(200).json({
      message: "Reviews fetched",
      data: reviews.map((review) => ({ ...review, reviewerName: review.user?.name || "Student", user: undefined })),
    });
  } catch (error) {
    console.log(`Fetching owner reviews failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PUT /api/reviews/:reviewId/reply  { text }  (owner of the reviewed hostel)
const replyToReview = async (req, res) => {
  const { reviewId } = req.params;
  const { text } = req.body || {};
  if (!isObjectId(reviewId)) return res.status(400).json({ message: "Invalid review id" });
  if (typeof text !== "string" || !text.trim() || text.length > 1000) {
    return res.status(400).json({ message: "Reply must be between 1 and 1000 characters" });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (String(review.hostel) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    review.ownerReply = { text: text.trim(), repliedAt: new Date() };
    await review.save();

    const [hostel, reviewer] = await Promise.all([
      Hostel.findById(review.hostel).select("authUser hostel_name"),
      User.findById(review.user).select("authUser"),
    ]);
    if (reviewer?.authUser) {
      await Notification.create({
        sender: hostel?.authUser,
        receiver: reviewer.authUser,
        message: `The owner of ${hostel?.hostel_name || "a hostel"} replied to your review.`,
        markRead: "no",
      });
    }

    res.status(200).json({ message: "Reply saved", data: { ownerReply: review.ownerReply } });
  } catch (error) {
    console.log(`Replying to review failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getHostelReviews, createReview, getOwnerReviews, replyToReview };
