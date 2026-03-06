const Booking = require('../models/Booking');
const { logAction } = require('./auditController');

// ──────────────────────────────────────
// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private (admin)
// ──────────────────────────────────────
exports.getBookings = async (req, res) => {
    try {
        const { status, buildingId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (buildingId) filter.buildingId = buildingId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            Booking.find(filter).sort('-createdAt').skip(skip).limit(limit),
            Booking.countDocuments(filter),
        ]);
        res.status(200).json({ success: true, count: bookings.length, total, page, totalPages: Math.ceil(total / limit), data: bookings });
    } catch (err) {
        console.error('[bookingController] getBookings error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   POST /api/bookings
// @desc    Create a new booking (public or admin)
// @access  Public
// ──────────────────────────────────────
exports.createBooking = async (req, res) => {
    try {
        const booking = await Booking.create(req.body);
        await logAction({ action: 'booking_created', performedBy: 'system', targetType: 'booking', targetId: booking._id.toString(), description: `Booking created for ${req.body.name || 'guest'}` });
        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        console.error('[bookingController] createBooking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   PUT /api/bookings/:id
// @desc    Update booking status/details
// @access  Private (admin)
// ──────────────────────────────────────
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        console.error('[bookingController] updateBooking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Private (admin)
// ──────────────────────────────────────
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.status(200).json({ success: true, message: 'Booking deleted' });
    } catch (err) {
        console.error('[bookingController] deleteBooking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   GET /api/bookings/waitlist
// @desc    Get waitlisted bookings
// @access  Private (admin)
// ──────────────────────────────────────
exports.getWaitlist = async (req, res) => {
    try {
        const waitlist = await Booking.find({ status: 'waitlist' }).sort('createdAt');
        res.status(200).json({ success: true, count: waitlist.length, data: waitlist });
    } catch (err) {
        console.error('[bookingController] getWaitlist error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
