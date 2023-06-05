const mongoose = require("mongoose");
const hostelSchema = new mongoose.Schema(
  {
    hostel_id: {
      type: String,
      required: true,
      unique: true,
    },
    hostel_name: {
      type: String,
      required: true,
    },
    hostel_address: {
      type: Object,
      required: true,
    },
    hostel_gender_type: {
      type: String,
      enum: ["Boys", "Girls", "Both"],
      required: true,
    },
    hostel_rent: {
      type: Number,
      required: true,
    },
    hostel_facilities: {
      type: Array,
      required: true,
    },
    hostel_rating: {
      type: Number,
      required: true,
    },
    hostel_img: [
      {
        data: {
          type: Buffer,
          required: true,
        },
        contentType: {
          type: String,
          required: true,
        },
      },
    ],
    owner_name: {
      type: String,
      required: true,
    },
    owner_phone_number: {
      type: String,
      required: true,
    },
    owner_email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

exports.Hostel = mongoose.model("Hostel", hostelSchema);
