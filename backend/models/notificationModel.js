const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Optional: inquiries can come from students who aren't logged in.
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  markRead: {
    type: String,
    enum:["yes","no"],
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index({ receiver: 1, createdAt: -1 });

exports.Notification = mongoose.model('Notification', notificationSchema);