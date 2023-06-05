const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
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
  user_hostel_id: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

exports.User = mongoose.model("User", userSchema);
