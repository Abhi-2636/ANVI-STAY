const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
    {
        buildingId: { type: String, required: true, trim: true },
        roomNo: { type: Number, required: true },
        guestName: { type: String, required: true, trim: true },
        guestIdNumber: { type: String, default: '', trim: true },
        purpose: { type: String, default: 'visit', trim: true },
        duration: { type: String, default: '', trim: true }, // e.g. '1 night', '2 days'
        checkIn: { type: Date, default: Date.now },
        checkOut: { type: Date },
        status: {
            type: String,
            enum: ['active', 'checked-out'],
            default: 'active',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Guest', guestSchema);
