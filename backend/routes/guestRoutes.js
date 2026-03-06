const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { registerGuest, getGuests, checkoutGuest } = require('../controllers/guestController');

// Tenant can register guest (no auth required — verified at app level)
router.post('/', registerGuest);

// Admin only
router.get('/', protect, getGuests);
router.put('/:id/checkout', protect, checkoutGuest);

module.exports = router;
