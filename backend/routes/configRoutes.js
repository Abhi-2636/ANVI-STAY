const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConfig, upsertConfig, getAllConfigs } = require('../controllers/configController');

// Admin only — must be before /:key to avoid wildcard conflict
router.get('/', protect, getAllConfigs);

// Public — get branding/config by key
router.get('/:key', getConfig);

// Admin only
router.put('/:key', protect, upsertConfig);

module.exports = router;
