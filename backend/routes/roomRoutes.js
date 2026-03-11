const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    tenantLogin,
    getRooms,
    getRoom,
    upsertRoom,
    deleteRoom,
    submitComplaint,
    submitUpiPayment,
    reviewUpiPayment,
    registerGuest,
    getRevenueAnalytics,
    getStudentDirectory,
    addMaintenanceWork,
    updateMaintenanceWork,
    getAvailability,
    swapRoom,
    submitNoticePeriod,
    submitFeedback,
    bulkPriceUpdate,
    getDocumentExpiryAlerts,
    getRevenueReport,
    getFeedbackSummary,
    getDashboardStats,
} = require('../controllers/roomController');

/**
 * @swagger
 * /api/rooms/tenant-login:
 *   post:
 *     summary: Tenant login
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buildingId: { type: string }
 *               roomNo: { type: number }
 *               password: { type: string }
 *     responses:
 *       200: { description: Tenant logged in }
 *       401: { description: Invalid credentials }
 */
router.post('/tenant-login', tenantLogin);

// ── Public: Real-time room availability per building ──
router.get('/availability', getAvailability);

/**
 * @swagger
 * /api/rooms/directory:
 *   get:
 *     summary: Get student directory (opted-in students)
 *     tags: [Rooms]
 *     responses:
 *       200: { description: Student directory }
 */
router.get('/directory', getStudentDirectory);

// ── Public (tenant complaint — verified via password in body) ──
router.post('/:buildingId/:roomNo/complaint', submitComplaint);

// ── Public (tenant UPI payment submission — verified via password) ──
router.post('/:buildingId/:roomNo/upi-verify', submitUpiPayment);

// ── Public (tenant guest registration — verified via password) ──
router.post('/:buildingId/:roomNo/guest', registerGuest);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms (admin, paginated)
 *     tags: [Rooms]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: buildingId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Vacant, Occupied, Booked] }
 *       - in: query
 *         name: rentPaid
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or phone
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 200 }
 *     responses:
 *       200: { description: Paginated room list }
 */
router.get('/', protect, getRooms);

// ── Admin: Dashboard Stats ──
router.get('/dashboard-stats', protect, getDashboardStats);

/**
 * @swagger
 * /api/rooms/analytics/revenue:
 *   get:
 *     summary: Get comprehensive revenue analytics
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Analytics data }
 */
router.get('/analytics/revenue', protect, getRevenueAnalytics);

router.get('/:buildingId/:roomNo', protect, getRoom);
router.put('/:buildingId/:roomNo', protect, upsertRoom);
router.delete('/:buildingId/:roomNo', protect, deleteRoom);

// ── Admin: Review UPI payment ──
router.put('/:buildingId/:roomNo/upi-verify/:paymentId', protect, reviewUpiPayment);

// ── Admin: Maintenance work assignment ──
router.post('/:buildingId/:roomNo/maintenance', protect, addMaintenanceWork);
router.put('/:buildingId/:roomNo/maintenance/:ticketId', protect, updateMaintenanceWork);

// ── Admin: Room swap/transfer ──
router.post('/swap', protect, swapRoom);

// ── Admin: Bulk price update ──
router.put('/bulk-price', protect, bulkPriceUpdate);

// ── Admin: Document expiry alerts ──
router.get('/document-expiry-alerts', protect, getDocumentExpiryAlerts);

// ── Admin: Revenue report ──
router.get('/revenue-report', protect, getRevenueReport);

// ── Public: Feedback summary (ratings per building) ──
router.get('/feedback-summary', getFeedbackSummary);

// ── Notice period (tenant/admin) ──
router.put('/:buildingId/:roomNo/notice', submitNoticePeriod);

// ── Tenant feedback ──
router.post('/:buildingId/:roomNo/feedback', submitFeedback);

module.exports = router;
