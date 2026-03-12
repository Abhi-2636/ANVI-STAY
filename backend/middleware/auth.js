const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Protect routes – verifies Bearer token and attaches admin to req.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized – no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated or not found' });
    }

    // ── Strict Concurrent Session Limits ──
    // Match the signature of the token against what's saved. If it doesn't match, they logged in elsewhere.
    const tokenSignature = token.split('.')[2];
    if (req.admin.currentSessionToken && req.admin.currentSessionToken !== tokenSignature) {
      return res.status(401).json({ success: false, message: 'Session logged out: You logged in from another device.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

/**
 * Restrict to specific roles. Also supports JIT Elevated Privileges.
 * Usage: authorize('superadmin', 'admin')
 */
const authorize = (...roles) => (req, res, next) => {
  // If user has the required role, great.
  if (roles.includes(req.admin.role)) {
    return next();
  }

  // JIT Elevated Privileges Exception:
  // If the route strictly requires superadmin, but admin has active God Mode, allow it.
  if (roles.includes('superadmin') && req.admin.jitActiveUntil && new Date() < new Date(req.admin.jitActiveUntil)) {
    req.admin.isJITActivated = true;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: `Role "${req.admin.role}" is not authorized for this action`,
  });
};

module.exports = { protect, authorize };
