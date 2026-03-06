const Visitor = require('../models/Visitor');

// GET /api/visitors?buildingId=sp1&date=2026-03-06
exports.getVisitors = async (req, res) => {
    try {
        const filter = {};
        if (req.query.buildingId) filter.buildingId = req.query.buildingId;
        if (req.query.date) {
            filter.inTime = { $regex: `^${req.query.date}` };
        }
        const visitors = await Visitor.find(filter).sort('-createdAt').limit(200);
        res.json({ success: true, data: visitors });
    } catch (err) {
        console.error('[visitorController] getVisitors:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/visitors
exports.addVisitor = async (req, res) => {
    try {
        const v = await Visitor.create(req.body);
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
