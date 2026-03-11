const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    text: {
      type: String,
      required: [true, 'Notice text is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['info', 'warning', 'urgent', 'general'],
      default: 'info',
    },
    // ── Visibility ──
    isActive: {
      type: Boolean,
      default: true,
    },
    // ── Auto-expiry ──
    expiresAt: {
      type: Date,
      default: null,
    },
    // ── Audience targeting ──
    targetAudience: {
      type: String,
      enum: ['all', 'building-specific', 'occupied-only'],
      default: 'all',
    },
    targetBuildingId: {
      type: String,
      trim: true,
      default: '', // only used when targetAudience = 'building-specific'
    },
    // ── Posted by ──
    postedBy: {
      type: String,
      trim: true,
      default: 'Admin',
    },
  },
  { timestamps: true }
);

// Auto-deactivate expired notices using a partial index
noticeSchema.index({ expiresAt: 1 }, { sparse: true });
noticeSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
