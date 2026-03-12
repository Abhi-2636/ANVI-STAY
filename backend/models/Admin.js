const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    // ── Two-Factor Authentication ──
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
      default: '',
    },
    // ── Password Reset ──
    passwordResetToken: {
      type: String,
      select: false,
    },
    // ── Strict Concurrent Session Limit ──
    currentSessionToken: {
      type: String, // Stores the active token signature or hash
      default: '',
    },
    // ── Just-In-Time (JIT) Elevated Privileges ──
    jitActiveUntil: {
      type: Date, // If now < jitActiveUntil, admin has god mode
    },
  },
  { timestamps: true }
);

// ---- Hash password before save ----
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- Compare password helper ----
adminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
