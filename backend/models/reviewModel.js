const mongoose = require("mongoose");

// Reviews live in their own collection and reference the hostel, so hostel documents
// never grow with review volume.
const reviewSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Set when the reviewer had an accepted booking at this hostel.
    isVerifiedStay: {
      type: Boolean,
      default: false,
    },
    // Filled in by the AI layer (Phase 3); absent until analysed.
    sentiment: {
      label: {
        type: String,
        enum: ["positive", "neutral", "negative", "mixed"],
      },
      score: {
        type: Number,
        min: -1,
        max: 1,
      },
      analyzedAt: Date,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    ownerReply: {
      text: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per hostel; listing a hostel's approved reviews newest-first.
reviewSchema.index({ hostel: 1, user: 1 }, { unique: true });
reviewSchema.index({ hostel: 1, status: 1, createdAt: -1 });

exports.Review = mongoose.model("Review", reviewSchema);
