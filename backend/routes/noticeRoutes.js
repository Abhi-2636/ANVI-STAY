const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getActiveNotices,
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');

// Public — tenants see active notices
router.get('/', getActiveNotices);

// Admin only
router.get('/all', protect, getAllNotices);
router.post('/', protect, createNotice);
router.put('/:id', protect, updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;
