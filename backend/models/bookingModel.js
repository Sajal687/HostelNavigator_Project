const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
        hostel:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        hostel_name:{
            type: String,
            required: true,
        },
        user_name: {
            type: String,
            required: true,
        },
        user_email:{
            type: String,
            required: true,
        },
        user_phone:{
            type: String,
            required: true,
        },
        checkin_date:{
            type: String,
            required: true,
        },
        user_gender:{
            type: String,
            required: true,
        },
        desired_roomtype:{
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        created_at: {
            type: Date,
            default: Date.now,
          },
});

exports.Booking = mongoose.model("Booking" , bookingSchema);