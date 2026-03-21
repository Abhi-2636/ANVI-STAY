const Guest = require('../models/Guest');

// POST /api/guests — register a guest (tenant, verified via room password in body)
exports.registerGuest = async (req, res) => {
    try {
        const { buildingId, roomNo, guestName, guestIdNumber, purpose, duration } = req.body;
        if (!buildingId || !roomNo || !guestName) {
            return res.status(400).json({ success: false, message: 'Building, room, and guest name are required.' });
        }
        const guest = await Guest.create({ buildingId, roomNo, guestName, guestIdNumber, purpose, duration });
        res.status(201).json({ success: true, data: guest });
    } catch (err) {
        console.error('[guestController] registerGuest error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/guests — list guests (admin, optionally filter by building/room)
exports.getGuests = async (req, res) => {
    try {
        const filter = {};
        if (req.query.buildingId) filter.buildingId = req.query.buildingId;
        if (req.query.roomNo) filter.roomNo = Number(req.query.roomNo);
        if (req.query.status) filter.status = req.query.status;
        const guests = await Guest.find(filter).sort('-createdAt').limit(100);
        res.status(200).json({ success: true, count: guests.length, data: guests });
    } catch (err) {
        console.error('[guestController] getGuests error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/guests/:id — checkout a guest (admin)
exports.checkoutGuest = async (req, res) => {
    try {
        const guest = await Guest.findByIdAndUpdate(
            req.params.id,
            { status: 'checked-out', checkOut: new Date() },
            { new: true }
        );
        if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
        res.status(200).json({ success: true, data: guest });
    } catch (err) {
        console.error('[guestController] checkoutGuest error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
