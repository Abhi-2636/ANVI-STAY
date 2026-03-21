/**
 * Email Routes
 */
const express = require('express');
const router = express.Router();
const { sendManualEmail, sendBulkReminder } = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

router.post('/send', protect, sendManualEmail);
router.post('/bulk-reminder', protect, sendBulkReminder);

module.exports = router;
