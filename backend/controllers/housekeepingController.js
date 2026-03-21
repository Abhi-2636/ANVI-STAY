const Housekeeping = require('../models/Housekeeping');

// ──────────────────────────────────────
// @route   GET /api/housekeeping
// @desc    Get all housekeeping tasks
// @access  Private (admin)
// ──────────────────────────────────────
exports.getTasks = async (req, res) => {
    try {
        const { status, buildingId, date } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (buildingId) filter.buildingId = buildingId;
        if (date) filter.scheduledDate = date;

        const tasks = await Housekeeping.find(filter).sort('-scheduledDate');
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        console.error('[housekeepingController] getTasks error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   POST /api/housekeeping
// @desc    Create a housekeeping task
// @access  Private (admin) or Public (tenant request)
// ──────────────────────────────────────
exports.createTask = async (req, res) => {
    try {
        const task = await Housekeeping.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (err) {
        console.error('[housekeepingController] createTask error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   PUT /api/housekeeping/:id
// @desc    Update a housekeeping task
// @access  Private (admin)
// ──────────────────────────────────────
exports.updateTask = async (req, res) => {
    try {
        if (req.body.status === 'completed' && !req.body.completedAt) {
            req.body.completedAt = new Date();
        }
        const task = await Housekeeping.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        console.error('[housekeepingController] updateTask error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   DELETE /api/housekeeping/:id
// @desc    Delete a housekeeping task
// @access  Private (admin)
// ──────────────────────────────────────
exports.deleteTask = async (req, res) => {
    try {
        const task = await Housekeeping.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (err) {
        console.error('[housekeepingController] deleteTask error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   GET /api/housekeeping/stats
// @desc    Get housekeeping statistics
// @access  Private (admin)
// ──────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const [scheduled, inProgress, completed, overdue] = await Promise.all([
            Housekeeping.countDocuments({ status: 'scheduled' }),
            Housekeeping.countDocuments({ status: 'in-progress' }),
            Housekeeping.countDocuments({ status: 'completed' }),
            Housekeeping.countDocuments({ status: 'overdue' }),
        ]);
        res.status(200).json({
            success: true,
            data: { scheduled, inProgress, completed, overdue, total: scheduled + inProgress + completed + overdue },
        });
    } catch (err) {
        console.error('[housekeepingController] getStats error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
