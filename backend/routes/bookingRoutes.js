const express = require('express');
const router = express.Router();
const {getBookingByHostelId , createBooking , updateBookingStatus} = require('../controllers/bookingController');
const { authenticate, requireRole, requireSelf } = require('../middleware/auth');

// :id is the hostel id; owners can only see their own hostel's bookings.
router.get('/bookings/:id', authenticate, requireRole("hostelOwner"), requireSelf("id"), getBookingByHostelId);
router.post('/bookings', authenticate, requireRole("hostelUser"), createBooking);
router.put('/bookings/:bookingId', authenticate, requireRole("hostelOwner"), updateBookingStatus);

module.exports = router;
