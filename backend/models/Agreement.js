const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema(
    {
        buildingId: { type: String, required: true, trim: true },
        roomNo: { type: Number, required: true },
        tenantName: { type: String, required: true, trim: true },
        tenantPhone: { type: String, default: '', trim: true },

        // Agreement details
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        rentAmount: { type: Number, required: true },
        securityDeposit: { type: Number, default: 0 },
        maintenanceCharge: { type: Number, default: 300 },
        electricityRate: { type: Number, default: 13 },

        // Terms
        terms: [{ type: String }],
        specialConditions: { type: String, default: '', trim: true },

        // Signatures
        tenantSigned: { type: Boolean, default: false },
        tenantSignature: { type: String, default: '' }, // base64 data URL
        tenantSignedAt: { type: Date },
        landlordSigned: { type: Boolean, default: false },
        landlordSignature: { type: String, default: '' },
        landlordSignedAt: { type: Date },

        // Status
        status: {
            type: String,
            enum: ['draft', 'sent', 'tenant-signed', 'fully-signed', 'expired', 'terminated'],
            default: 'draft',
        },

        // Renewal
        isRenewal: { type: Boolean, default: false },
        previousAgreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agreement' },
        renewalReminded: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Agreement', agreementSchema);
