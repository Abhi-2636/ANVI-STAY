const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
    {
        buildingId: { type: String, required: true, trim: true },
        roomNo: { type: Number, required: true },
        visitorName: { type: String, required: true, trim: true },
        visitorPhone: { type: String, default: '', trim: true },
        tenantName: { type: String, default: '', trim: true },
        purpose: { type: String, default: 'Visit', trim: true },
        idProofType: { type: String, default: '', trim: true },
        idProofUrl: { type: String, default: '' },
        inTime: { type: String, required: true },
        outTime: { type: String, default: '' },
        status: { type: String, enum: ['in', 'out'], default: 'in' },
    },
    { timestamps: true }
);

visitorSchema.index({ buildingId: 1, createdAt: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
