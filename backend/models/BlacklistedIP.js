const mongoose = require('mongoose');

const BlacklistedIPSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BlacklistedIP', BlacklistedIPSchema);
