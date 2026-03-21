/**
 * Maintenance Controller – Full CRUD for cross-room maintenance tickets
 */
const Maintenance = require('../models/Maintenance');
const { logAction } = require('./auditController');

// ──────────────────────────────────────
// @route   GET /api/maintenance
// @desc    Get all tickets (with filters + pagination)
// @access  Private (admin)
// ──────────────────────────────────────
exports.getTickets = async (req, res) => {
    try {
        const filter = {};
        if (req.query.buildingId) filter.buildingId = req.query.buildingId;
        if (req.query.roomNo) filter.roomNo = Number(req.query.roomNo);
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.assignedTo) filter.assignedTo = { $regex: req.query.assignedTo, $options: 'i' };
        if (req.query.category) filter.category = req.query.category;

        // Date range filter
        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [tickets, total] = await Promise.all([
            Maintenance.find(filter).sort({ priority: -1, createdAt: -1 }).skip(skip).limit(limit),
            Maintenance.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            count: tickets.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: tickets,
        });
    } catch (err) {
        console.error('[maintenanceController] getTickets error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   GET /api/maintenance/stats
// @desc    Get maintenance stats (open counts by priority, category, etc.)
// @access  Private (admin)
// ──────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const [byStatus, byPriority, byCategory, recentResolved] = await Promise.all([
            Maintenance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Maintenance.aggregate([
                { $match: { status: { $in: ['open', 'in-progress'] } } },
                { $group: { _id: '$priority', count: { $sum: 1 } } },
            ]),
            Maintenance.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
            Maintenance.find({ status: 'resolved' }).sort('-resolvedAt').limit(5).select('buildingId roomNo description resolvedAt actualCost'),
        ]);

        res.status(200).json({
            success: true,
            data: { byStatus, byPriority, byCategory, recentResolved },
        });
    } catch (err) {
        console.error('[maintenanceController] getStats error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   GET /api/maintenance/:id
// @desc    Get single ticket
// @access  Private (admin)
// ──────────────────────────────────────
exports.getTicket = async (req, res) => {
    try {
        const ticket = await Maintenance.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        console.error('[maintenanceController] getTicket error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   POST /api/maintenance
// @desc    Create a maintenance ticket
// @access  Private (admin)
// ──────────────────────────────────────
exports.createTicket = async (req, res) => {
    try {
        const { buildingId, roomNo, description, title, category, priority, assignedTo, photoUrl, estimatedCost, reportedBy, tenantName } = req.body;

        if (!buildingId || !roomNo || !description) {
            return res.status(400).json({ success: false, message: 'buildingId, roomNo, and description are required' });
        }

        const ticket = await Maintenance.create({
            buildingId,
            roomNo: Number(roomNo),
            tenantName: tenantName || '',
            title: title || '',
            description,
            category: category || 'other',
            priority: priority || 'medium',
            assignedTo: assignedTo || '',
            assignedAt: assignedTo ? new Date() : null,
            photoUrl: photoUrl || '',
            estimatedCost: estimatedCost || 0,
            reportedBy: reportedBy || 'admin',
        });

        await logAction({
            action: 'ticket_created',
            performedBy: req.admin?.name || 'admin',
            performedByRole: req.admin?.role || 'admin',
            targetType: 'maintenance',
            targetId: ticket._id.toString(),
            description: `Maintenance ticket created for ${buildingId}-${roomNo}: "${description.substring(0, 50)}"`,
            ipAddress: req.ip,
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        console.error('[maintenanceController] createTicket error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   PUT /api/maintenance/:id
// @desc    Update a maintenance ticket
// @access  Private (admin)
// ──────────────────────────────────────
exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Maintenance.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        const { status, priority, assignedTo, resolutionNote, actualCost, category, title, description, photoUrl, estimatedCost } = req.body;

        if (status !== undefined) {
            ticket.status = status;
            if (status === 'resolved' || status === 'closed') {
                ticket.resolvedAt = new Date();
            }
        }
        if (priority !== undefined) ticket.priority = priority;
        if (assignedTo !== undefined) {
            ticket.assignedTo = assignedTo;
            if (assignedTo && !ticket.assignedAt) ticket.assignedAt = new Date();
        }
        if (resolutionNote !== undefined) ticket.resolutionNote = resolutionNote;
        if (actualCost !== undefined) ticket.actualCost = actualCost;
        if (category !== undefined) ticket.category = category;
        if (title !== undefined) ticket.title = title;
        if (description !== undefined) ticket.description = description;
        if (photoUrl !== undefined) ticket.photoUrl = photoUrl;
        if (estimatedCost !== undefined) ticket.estimatedCost = estimatedCost;

        await ticket.save();

        await logAction({
            action: 'ticket_resolved',
            performedBy: req.admin?.name || 'admin',
            performedByRole: req.admin?.role || 'admin',
            targetType: 'maintenance',
            targetId: ticket._id.toString(),
            description: `Maintenance ticket ${req.params.id} updated — status: ${ticket.status}`,
            ipAddress: req.ip,
        });

        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        console.error('[maintenanceController] updateTicket error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   DELETE /api/maintenance/:id
// @desc    Delete a maintenance ticket
// @access  Private (admin)
// ──────────────────────────────────────
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Maintenance.findByIdAndDelete(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.status(200).json({ success: true, message: 'Ticket deleted' });
    } catch (err) {
        console.error('[maintenanceController] deleteTicket error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
