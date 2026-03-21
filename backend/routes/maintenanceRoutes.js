const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getTickets,
    getTicket,
    getStats,
    createTicket,
    updateTicket,
    deleteTicket,
} = require('../controllers/maintenanceController');

router.get('/stats', protect, getStats);
router.get('/', protect, getTickets);
router.post('/', protect, createTicket);
router.get('/:id', protect, getTicket);
router.put('/:id', protect, updateTicket);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteTicket);

module.exports = router;
