const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  authUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuthUser",
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  email_address: {
    type: String,
    required: true,
    unique: true,
  },
  current_hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
  },
  previous_hostels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
    }
  ],
  feedbacks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
    }
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

exports.User = mongoose.model("User", userSchema);
