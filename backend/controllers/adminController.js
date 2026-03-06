const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { logAction } = require('./auditController');

// Helper – generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Helper – send token response
const sendTokenResponse = (admin, statusCode, res) => {
  const token = signToken(admin._id);
  const data = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
  };
  res.status(statusCode).json({ success: true, token, data });
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

    sendTokenResponse(admin, 200, res);
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

    sendTokenResponse(admin, 200, res);
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
