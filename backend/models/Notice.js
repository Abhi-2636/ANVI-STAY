const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Notice text is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['info', 'warning', 'urgent'],
      default: 'info',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
