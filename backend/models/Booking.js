const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        // Prospect info
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, default: '', trim: true },
        college: { type: String, default: '', trim: true },
        course: { type: String, default: '', trim: true },

        // Booking details
        buildingId: { type: String, default: '', trim: true },
        preferredRoomType: { type: String, enum: ['single', 'double', 'triple', ''], default: '' },
        moveInDate: { type: String, default: '' },
        duration: { type: String, default: '', trim: true }, // e.g. '6 months', '1 year'

        // Payment
        advanceAmount: { type: Number, default: 0 },
        advancePaid: { type: Boolean, default: false },
        advanceUTR: { type: String, default: '' },

        // Status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'waitlist', 'cancelled', 'checked-in'],
            default: 'pending',
        },

        // Notes
        notes: { type: String, default: '', trim: true },
        leadSource: {
            type: String,
            enum: ['instagram', 'google', 'whatsapp', 'banner', 'referral', 'walk-in', 'website', 'other', ''],
            default: 'website',
        },

        // Assigned room (after confirmation)
        assignedBuildingId: { type: String, default: '' },
        assignedRoomNo: { type: Number, default: 0 },

        // Follow-up
        lastFollowUp: { type: Date },
        followUpNotes: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
