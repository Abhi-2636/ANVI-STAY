/**
 * Billing Model – Monthly billing records auto-generated
 */
const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    buildingId: { type: String, required: true, trim: true },
    roomNo: { type: Number, required: true },
    tenantName: { type: String, default: '' },
    tenantPhone: { type: String, default: '' },
    month: { type: String, required: true },     // e.g., '2026-03'
    year: { type: Number, required: true },

    // Rent
    rentAmount: { type: Number, default: 0 },
    rentPaid: { type: Boolean, default: false },
    rentPaidAt: { type: Date, default: null },
    rentUtrNumber: { type: String, default: '' },

    // Electricity
    elecUnits: { type: Number, default: 0 },
    elecRate: { type: Number, default: 13 },
    elecAmount: { type: Number, default: 0 },
    elecPaid: { type: Boolean, default: false },
    elecPaidAt: { type: Date, default: null },
    elecUtrNumber: { type: String, default: '' },

    // Maintenance
    maintCharge: { type: Number, default: 300 },

    // Previous dues carried forward
    previousDues: { type: Number, default: 0 },

    // Total
    totalAmount: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['generated', 'partially-paid', 'fully-paid', 'overdue'],
        default: 'generated',
    },

    generatedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    notes: { type: String, default: '' },
}, { timestamps: true });

billingSchema.index({ buildingId: 1, roomNo: 1, month: 1 }, { unique: true });
billingSchema.index({ status: 1, month: 1 });

module.exports = mongoose.model('Billing', billingSchema);
