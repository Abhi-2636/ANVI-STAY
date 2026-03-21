const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { logAction } = require('./auditController');

// Helper – generate short-lived access token (15 min)
const signAccessToken = (id) =>
  jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

// Helper – generate long-lived refresh token (7 days)
const signRefreshToken = (id) =>
  jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

// Helper – send access + refresh token response
const sendTokenResponse = async (admin, statusCode, res) => {
  const accessToken = signAccessToken(admin._id);
  const refreshToken = signRefreshToken(admin._id);
  
  // Track concurrent session
  admin.currentSessionToken = accessToken.split('.')[2];
  await admin.save({ validateBeforeSave: false });

  const data = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
  };
  res.status(statusCode).json({ success: true, token: accessToken, refreshToken, data });
};

// ──────────────────────────────────────
// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
// ──────────────────────────────────────
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    await logAction({
      action: 'admin_login',
      performedBy: admin.email,
      performedByRole: admin.role,
      targetType: 'admin',
      targetId: admin._id.toString(),
      description: `Admin ${admin.name} logged in`,
      ipAddress: req.ip,
    });

    await sendTokenResponse(admin, 200, res);
  } catch (err) {
    console.error('[adminController] loginAdmin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/admin/me
// @desc    Get current logged-in admin profile
// @access  Private
// ──────────────────────────────────────
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.admin });
};

// ──────────────────────────────────────
// @route   PUT /api/admin/me
// @desc    Update own profile (name, email, password)
// @access  Private
// ──────────────────────────────────────
exports.updateMe = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await Admin.findById(req.admin._id).select('+password');

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) admin.password = password;

    await admin.save();

    await sendTokenResponse(admin, 200, res);
  } catch (err) {
    console.error('[adminController] updateMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/admin/users
// @desc    List all admin users
// @access  Private (superadmin only)
// ──────────────────────────────────────
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort('-createdAt');
    res.status(200).json({ success: true, count: admins.length, data: admins });
  } catch (err) {
    console.error('[adminController] getAllAdmins error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/admin/users
// @desc    Create a new admin user
// @access  Private (superadmin only)
// ──────────────────────────────────────
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const admin = await Admin.create({ name, email, password, role });

    await logAction({
      action: 'admin_created',
      performedBy: req.admin?.email || 'system',
      performedByRole: req.admin?.role || 'superadmin',
      targetType: 'admin',
      targetId: admin._id.toString(),
      description: `Admin user ${name} (${email}) created with role: ${role || 'admin'}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (err) {
    console.error('[adminController] createAdmin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   PUT /api/admin/users/:id
// @desc    Update any admin user
// @access  Private (superadmin only)
// ──────────────────────────────────────
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, role, isActive, password } = req.body;
    const admin = await Admin.findById(req.params.id).select('+password');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (name !== undefined) admin.name = name;
    if (email !== undefined) admin.email = email;
    if (role !== undefined) admin.role = role;
    if (isActive !== undefined) admin.isActive = isActive;
    if (password) admin.password = password;

    await admin.save();

    res.status(200).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (err) {
    console.error('[adminController] updateAdmin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   DELETE /api/admin/users/:id
// @desc    Delete an admin user
// @access  Private (superadmin only)
// ──────────────────────────────────────
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await admin.deleteOne();

    res.status(200).json({ success: true, message: 'Admin deleted' });
  } catch (err) {
    console.error('[adminController] deleteAdmin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/admin/refresh-token
// @desc    Get a new access token using a valid refresh token
// @access  Public
// ──────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated' });
    }

    const accessToken = signAccessToken(admin._id);
    const newRefreshToken = signRefreshToken(admin._id);

    res.status(200).json({ success: true, token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Refresh token invalid or expired. Please log in again.' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/admin/forgot-password
// @desc    Send password reset email
// @access  Public
// ──────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration attacks
    if (!admin) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    admin.passwordResetToken = resetTokenHash;
    admin.passwordResetExpires = resetExpires;
    await admin.save({ validateBeforeSave: false });

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/pages/admin-login.html?reset=${resetToken}`;

    // Send email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"ANVI STAY" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: 'ANVI STAY – Password Reset Request',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#6366f1;">ANVI STAY – Password Reset</h2>
            <p>Hello <strong>${admin.name}</strong>,</p>
            <p>You requested a password reset. Click the button below to reset your password.</p>
            <p>This link is valid for <strong>30 minutes</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
            <p style="color:#999;margin-top:24px;">If you did not request this, please ignore this email. Your account is safe.</p>
          </div>
        `,
      });

      await logAction({
        action: 'system_event',
        performedBy: admin.email,
        performedByRole: admin.role,
        description: `Password reset email sent to ${admin.email}`,
        ipAddress: req.ip,
      });
    } catch (emailErr) {
      console.error('[adminController] Failed to send reset email:', emailErr);
      admin.passwordResetToken = undefined;
      admin.passwordResetExpires = undefined;
      await admin.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
    }

    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[adminController] forgotPassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/admin/reset-password/:token
// @desc    Reset password using token from email
// @access  Public
// ──────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
    }

    admin.password = password;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    await logAction({
      action: 'admin_updated',
      performedBy: admin.email,
      performedByRole: admin.role,
      description: `Password reset successfully for ${admin.email}`,
      ipAddress: req.ip,
    });

    await sendTokenResponse(admin, 200, res);
  } catch (err) {
    console.error('[adminController] resetPassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/admin/jit/request
// @desc    Request Just-in-Time Elevated Privileges
// @access  Private
// ──────────────────────────────────────
exports.requestJIT = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    
    // Auto-approve for demo/implementation purposes.
    // In production, this would send an email to superadmin and wait for approval.
    admin.jitActiveUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await admin.save();
    
    await logAction({
      action: 'jit_activated',
      performedBy: admin.email,
      performedByRole: admin.role,
      description: `Admin ${admin.email} temporarily elevated to Superadmin JIT mode for 15 minutes.`,
      ipAddress: req.ip,
    });
    
    return res.status(200).json({ success: true, message: 'JIT Elevated Privileges activated for 15 minutes.', expiresAt: admin.jitActiveUntil });
  } catch (err) {
    console.error('[adminController] requestJIT error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
