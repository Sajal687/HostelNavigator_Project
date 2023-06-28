const express = require('express');
const router = express.Router();
const {getBookingByHostelId , createBooking , updateBookingStatus} = require('../controllers/bookingController');
const {authenticate} = require('../controllers/userController');

router.get('/bookings/:id' , authenticate , getBookingByHostelId);
router.post('/bookings', authenticate, createBooking);
router.put('/bookings/:bookingId', updateBookingStatus);

module.exports = router;