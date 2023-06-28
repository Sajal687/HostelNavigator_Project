const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser',
    required: true,
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

exports.Notification = mongoose.model('Notification', notificationSchema);;