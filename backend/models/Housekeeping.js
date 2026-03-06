const mongoose = require('mongoose');

const housekeepingSchema = new mongoose.Schema(
    {
        buildingId: { type: String, required: true, trim: true },
        roomNo: { type: Number, default: 0 }, // 0 = common area
        areaName: { type: String, default: '', trim: true }, // e.g. "Lobby", "Staircase"

        // Task details
        taskType: {
            type: String,
            enum: ['room-cleaning', 'bathroom-cleaning', 'common-area', 'laundry', 'deep-cleaning', 'pest-control', 'other'],
            default: 'room-cleaning',
        },
        description: { type: String, default: '', trim: true },

        // Schedule
        scheduledDate: { type: String, default: '' },
        scheduledTime: { type: String, default: '' },
        recurring: {
            type: String,
            enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly'],
            default: 'none',
        },
        recurringDay: { type: String, default: '' }, // e.g. 'Monday', '1st'

        // Assignment
        assignedTo: { type: String, default: '', trim: true },
        assignedPhone: { type: String, default: '', trim: true },

        // Status
        status: {
            type: String,
            enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'overdue'],
            default: 'scheduled',
        },
        completedAt: { type: Date },
        completionPhoto: { type: String, default: '' },
        completionNotes: { type: String, default: '', trim: true },

        // Requested by tenant
        requestedBy: { type: String, default: '', trim: true },
        isRequest: { type: Boolean, default: false },

        // Priority
        priority: {
            type: String,
            enum: ['low', 'normal', 'high', 'urgent'],
            default: 'normal',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Housekeeping', housekeepingSchema);
