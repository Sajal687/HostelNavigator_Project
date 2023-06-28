const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    authUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
    },
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
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postal_code: {
        type: String,
        required: true,
      },
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
    all_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hostel_rooms: 
      {
        room_number: {
          type: String,
          required: true,
        },
        room_capacity: {
          type: Array,
          required: true,
          // enum: ["Single", "Double", "Triple" , "Multi-Sharing"], 
        },
      }
  },
  {
    timestamps: true,
  }
);

exports.Hostel = mongoose.model("Hostel", hostelSchema);