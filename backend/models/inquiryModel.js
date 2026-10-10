const mongoose = require("mongoose");

// Lead/inquiry submitted from a hostel detail page. Students don't need an account.
const inquirySchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    // Set when the inquiry came from a logged-in student.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    student_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

// Owner dashboard: a hostel's inquiries filtered by status, newest first.
inquirySchema.index({ hostel: 1, status: 1, createdAt: -1 });

exports.Inquiry = mongoose.model("Inquiry", inquirySchema);
