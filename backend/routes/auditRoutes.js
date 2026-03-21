/**
 * Audit Log Routes
 */
const express = require('express');
const router = express.Router();
const { getLogs, getStats, cleanup } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getLogs);
router.get('/stats', protect, getStats);
router.delete('/cleanup', protect, cleanup);

module.exports = router;
