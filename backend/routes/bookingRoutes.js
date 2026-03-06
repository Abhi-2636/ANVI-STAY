const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    getWaitlist,
} = require('../controllers/bookingController');

// ── Public (anyone can submit a booking request) ──
router.post('/', createBooking);

// ── Admin only ──
router.get('/', protect, getBookings);
router.get('/waitlist', protect, getWaitlist);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
