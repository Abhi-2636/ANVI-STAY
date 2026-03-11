const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  loginAdmin,
  getMe,
  updateMe,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require('../controllers/adminController');

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns JWT token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /api/admin/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin profile }
 */
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all admin users (superadmin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of admins }
 *   post:
 *     summary: Create new admin user (superadmin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [superadmin, admin, manager] }
 *     responses:
 *       201: { description: Admin created }
 */
router.get('/users', protect, authorize('superadmin'), getAllAdmins);
router.post('/users', protect, authorize('superadmin'), createAdmin);
router.put('/users/:id', protect, authorize('superadmin'), updateAdmin);
router.delete('/users/:id', protect, authorize('superadmin'), deleteAdmin);

// ── Auth utilities (public) ──
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
