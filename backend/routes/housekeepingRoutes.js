const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getStats,
} = require('../controllers/housekeepingController');

// ── Public (tenant can submit a cleaning request) ──
router.post('/request', createTask);

// ── Admin only ──
router.get('/', protect, getTasks);
router.get('/stats', protect, getStats);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
