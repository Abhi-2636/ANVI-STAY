const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAgreements,
    getAgreement,
    createAgreement,
    updateAgreement,
    signAgreement,
    deleteAgreement,
    getExpiringAgreements,
} = require('../controllers/agreementController');

// ── Public (tenant can view and sign) ──
router.get('/:id', getAgreement);
router.put('/:id/sign', signAgreement);

// ── Admin only ──
router.get('/', protect, getAgreements);
router.get('/filter/expiring', protect, getExpiringAgreements);
router.post('/', protect, createAgreement);
router.put('/:id', protect, updateAgreement);
router.delete('/:id', protect, deleteAgreement);

module.exports = router;
