const Visitor = require('../models/Visitor');
const Room = require('../models/Room');
const { sendWhatsAppReminder } = require('../utils/whatsapp');
const { logAction } = require('./auditController');

// GET /api/visitors?buildingId=sp1&date=2026-03-06&page=1&limit=50
exports.getVisitors = async (req, res) => {
    try {
        const filter = {};
        if (req.query.buildingId) filter.buildingId = req.query.buildingId;
        if (req.query.roomNo) filter.roomNo = Number(req.query.roomNo);
        if (req.query.date) {
            const start = new Date(req.query.date);
            const end = new Date(req.query.date);
            end.setDate(end.getDate() + 1);
            filter.createdAt = { $gte: start, $lt: end };
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [visitors, total] = await Promise.all([
            Visitor.find(filter).sort('-createdAt').skip(skip).limit(limit),
            Visitor.countDocuments(filter),
        ]);

        res.json({ success: true, count: visitors.length, total, page, totalPages: Math.ceil(total / limit), data: visitors });
    } catch (err) {
        console.error('[visitorController] getVisitors:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/visitors – check in and notify tenant via WhatsApp
exports.addVisitor = async (req, res) => {
    try {
        const v = await Visitor.create(req.body);

        // Notify tenant about the visitor
        if (v.buildingId && v.roomNo) {
            try {
                const room = await Room.findOne({ buildingId: v.buildingId, roomNo: v.roomNo, status: 'Occupied' });
                if (room && room.phone) {
                    const roomInfo = `${v.buildingId}-${v.roomNo}`;
                    const visitorMsg = `Visitor Check-In Alert: ${v.visitorName} has checked in to visit you at Room ${roomInfo}. Purpose: ${v.purpose || 'Visit'}. Time: ${new Date().toLocaleTimeString('en-IN')}`;
                    await sendWhatsAppReminder(room.phone, room.name || 'Tenant', 0, visitorMsg, roomInfo);
                    console.log(`[VisitorController] Notified tenant ${room.name} (${room.phone}) about visitor ${v.visitorName}`);
                }
            } catch (notifyErr) {
                // Non-fatal – visitor still saved
                console.error('[visitorController] Failed to notify tenant:', notifyErr.message);
            }
        }

        await logAction({
            action: 'system_event',
            performedBy: req.admin?.name || 'visitor-checkin',
            performedByRole: req.admin?.role || 'system',
            targetType: 'visitor',
            targetId: v._id.toString(),
            description: `Visitor "${v.visitorName}" checked in for Room ${v.buildingId}-${v.roomNo}`,
            ipAddress: req.ip,
        });

        res.status(201).json({ success: true, data: v });
    } catch (err) {
        console.error('[visitorController] addVisitor:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/visitors/:id/checkout
exports.checkoutVisitor = async (req, res) => {
    try {
        const v = await Visitor.findByIdAndUpdate(
            req.params.id,
            { outTime: new Date().toISOString(), status: 'out' },
            { new: true }
        );
        if (!v) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: v });
    } catch (err) {
        console.error('[visitorController] checkout:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/visitors/:id
exports.deleteVisitor = async (req, res) => {
    try {
        await Visitor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
