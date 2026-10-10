const mongoose = require("mongoose");
const { Hostel } = require("../models/hostelModel");
const { Review } = require("../models/reviewModel");

// Recomputes a hostel's average rating and review count from its approved reviews.
// Call after any review is created or changes status.
const recomputeHostelRating = async (hostelId) => {
  const [stats] = await Review.aggregate([
    { $match: { hostel: new mongoose.Types.ObjectId(String(hostelId)), status: "approved" } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const hostel_rating = stats ? Math.round(stats.average * 10) / 10 : 0;
  const review_count = stats ? stats.count : 0;
  await Hostel.updateOne({ _id: hostelId }, { $set: { hostel_rating, review_count } });
  return { hostel_rating, review_count };
};

module.exports = { recomputeHostelRating };
