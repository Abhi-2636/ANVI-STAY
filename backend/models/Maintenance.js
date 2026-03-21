/**
 * Maintenance Model – Cross-room maintenance ticket tracking
 * Replaces the embedded tickets[] array in Room with a proper collection
 * so queries like "show all open tickets" work efficiently.
 */
const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
    {
        buildingId: { type: String, required: true, trim: true },
        roomNo: { type: Number, required: true },
        tenantName: { type: String, default: '', trim: true },

        // Ticket details
        title: { type: String, trim: true, default: '' },
        description: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ['plumbing', 'electrical', 'furniture', 'cleaning', 'internet', 'security', 'other'],
            default: 'other',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'on-hold', 'resolved', 'closed'],
            default: 'open',
        },

        // Assignment
        assignedTo: { type: String, trim: true, default: '' },
        assignedAt: { type: Date, default: null },

        // Media
        photoUrl: { type: String, default: '' },

        // Resolution
        resolvedAt: { type: Date, default: null },
        resolutionNote: { type: String, default: '', trim: true },

        // Cost tracking
        estimatedCost: { type: Number, default: 0 },
        actualCost: { type: Number, default: 0 },

        // Source
        reportedBy: {
            type: String,
            enum: ['admin', 'tenant', 'staff'],
            default: 'admin',
        },
    },
    { timestamps: true }
);

// Indexes for fast cross-building queries
maintenanceSchema.index({ buildingId: 1, status: 1 });
maintenanceSchema.index({ status: 1, priority: -1, createdAt: -1 });
maintenanceSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
