/**
 * Audit Log Controller – View & manage audit trail
 */
const AuditLog = require('../models/AuditLog');

// ── Helper: Create audit log entry (used by other controllers) ──
exports.logAction = async ({ action, performedBy, performedByRole, targetType, targetId, description, metadata, ipAddress }) => {
    try {
        await AuditLog.create({
            action,
            performedBy: performedBy || 'system',
            performedByRole: performedByRole || 'system',
            targetType: targetType || '',
            targetId: targetId || '',
            description: description || '',
            metadata: metadata || {},
            ipAddress: ipAddress || '',
        });
    } catch (err) {
        console.error('[AuditLog] Failed to write log:', err.message);
    }
};

// ──────────────────────────────────────
// @route   GET /api/audit
// @desc    Get audit logs (paginated)
// @access  Private (admin)
// ──────────────────────────────────────
exports.getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.action) filter.action = req.query.action;
        if (req.query.performedBy) filter.performedBy = { $regex: req.query.performedBy, $options: 'i' };
        if (req.query.targetType) filter.targetType = req.query.targetType;
        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(filter).sort('-createdAt').skip(skip).limit(limit),
            AuditLog.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            count: logs.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: logs,
        });
    } catch (err) {
        console.error('[auditController] getLogs error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   GET /api/audit/stats
// @desc    Get audit statistics
// @access  Private (admin)
// ──────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [totalToday, totalWeek, totalAll, recentActions] = await Promise.all([
            AuditLog.countDocuments({ createdAt: { $gte: today } }),
            AuditLog.countDocuments({ createdAt: { $gte: weekAgo } }),
            AuditLog.countDocuments(),
            AuditLog.aggregate([
                { $match: { createdAt: { $gte: weekAgo } } },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
        ]);

        res.status(200).json({
            success: true,
            data: { totalToday, totalWeek, totalAll, recentActions },
        });
    } catch (err) {
        console.error('[auditController] getStats error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   DELETE /api/audit/cleanup
// @desc    Delete old audit logs (older than 90 days)
// @access  Private (superadmin)
// ──────────────────────────────────────
exports.cleanup = async (req, res) => {
    try {
        const daysToKeep = parseInt(req.query.days) || 90;
        const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });

        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} logs older than ${daysToKeep} days`,
        });
    } catch (err) {
        console.error('[auditController] cleanup error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
