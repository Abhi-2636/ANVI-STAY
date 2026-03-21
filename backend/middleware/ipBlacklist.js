const BlacklistedIP = require('../models/BlacklistedIP');

const checkBlacklist = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const isBlacklisted = await BlacklistedIP.findOne({ ipAddress: ip });
    
    if (isBlacklisted) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
  } catch (err) {
    console.error('Blacklist check error:', err);
    next();
  }
};

module.exports = checkBlacklist;
