const Agreement = require('../models/Agreement');

// ──────────────────────────────────────
// @route   GET /api/agreements
// @desc    Get all agreements
// @access  Private (admin)
// ──────────────────────────────────────
exports.getAgreements = async (req, res) => {
    try {
        const { status, buildingId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (buildingId) filter.buildingId = buildingId;

        const agreements = await Agreement.find(filter).sort('-createdAt');
        res.status(200).json({ success: true, count: agreements.length, data: agreements });
    } catch (err) {
        console.error('[agreementController] getAgreements error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   GET /api/agreements/:id
// @desc    Get single agreement
// @access  Private
// ──────────────────────────────────────
exports.getAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ success: false, message: 'Agreement not found' });
        }
        res.status(200).json({ success: true, data: agreement });
    } catch (err) {
        console.error('[agreementController] getAgreement error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   POST /api/agreements
// @desc    Create a new agreement
// @access  Private (admin)
// ──────────────────────────────────────
exports.createAgreement = async (req, res) => {
    try {
        // Default terms if not provided
        if (!req.body.terms || req.body.terms.length === 0) {
            req.body.terms = [
                'Tenant shall pay rent on or before the 5th of every month.',
                'Security deposit will be refunded after deducting any dues upon vacating.',
                'Tenant shall maintain the room in good condition.',
                'No subletting or unauthorized occupants allowed.',
                'Electricity charges will be billed at the agreed rate per unit.',
                'Maintenance charges are fixed and non-refundable.',
                'Minimum notice period of 30 days required before vacating.',
                'Smoking, alcohol, and drugs are strictly prohibited on premises.',
                'Visitors must be registered at the reception.',
                'Management reserves the right to inspect rooms with prior notice.',
            ];
        }
        const agreement = await Agreement.create(req.body);
        res.status(201).json({ success: true, data: agreement });
    } catch (err) {
        console.error('[agreementController] createAgreement error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   PUT /api/agreements/:id
// @desc    Update an agreement
// @access  Private (admin)
// ──────────────────────────────────────
exports.updateAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!agreement) {
            return res.status(404).json({ success: false, message: 'Agreement not found' });
        }
        res.status(200).json({ success: true, data: agreement });
    } catch (err) {
        console.error('[agreementController] updateAgreement error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   PUT /api/agreements/:id/sign
// @desc    Sign an agreement (tenant or landlord)
// @access  Public (tenant) or Private (landlord)
// ──────────────────────────────────────
exports.signAgreement = async (req, res) => {
    try {
        const { role, signature } = req.body; // role: 'tenant' or 'landlord'
        const agreement = await Agreement.findById(req.params.id);
        if (!agreement) {
            return res.status(404).json({ success: false, message: 'Agreement not found' });
        }

        if (role === 'tenant') {
            agreement.tenantSigned = true;
            agreement.tenantSignature = signature;
            agreement.tenantSignedAt = new Date();
            if (agreement.landlordSigned) {
                agreement.status = 'fully-signed';
            } else {
                agreement.status = 'tenant-signed';
            }
        } else if (role === 'landlord') {
            agreement.landlordSigned = true;
            agreement.landlordSignature = signature;
            agreement.landlordSignedAt = new Date();
            if (agreement.tenantSigned) {
                agreement.status = 'fully-signed';
            }
        }

        await agreement.save();
        res.status(200).json({ success: true, data: agreement });
    } catch (err) {
        console.error('[agreementController] signAgreement error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   DELETE /api/agreements/:id
// @desc    Delete an agreement
// @access  Private (admin)
// ──────────────────────────────────────
exports.deleteAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findByIdAndDelete(req.params.id);
        if (!agreement) {
            return res.status(404).json({ success: false, message: 'Agreement not found' });
        }
        res.status(200).json({ success: true, message: 'Agreement deleted' });
    } catch (err) {
        console.error('[agreementController] deleteAgreement error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   GET /api/agreements/expiring
// @desc    Get agreements expiring within 30 days
// @access  Private (admin)
// ──────────────────────────────────────
exports.getExpiringAgreements = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const agreements = await Agreement.find({
            status: { $in: ['fully-signed', 'tenant-signed'] },
            endDate: { $lte: thirtyDaysLater.toISOString().split('T')[0], $gte: now.toISOString().split('T')[0] },
        }).sort('endDate');
        res.status(200).json({ success: true, count: agreements.length, data: agreements });
    } catch (err) {
        console.error('[agreementController] getExpiringAgreements error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
