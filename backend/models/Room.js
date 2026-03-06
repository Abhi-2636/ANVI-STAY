const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roomSchema = new mongoose.Schema(
  {
    buildingId: {
      type: String,
      required: [true, 'Building ID is required'],
      trim: true,
    },
    roomNo: {
      type: Number,
      required: [true, 'Room number is required'],
    },
    status: {
      type: String,
      enum: ['Vacant', 'Occupied', 'Booked'],
      default: 'Vacant',
    },

    // ── Tenant info ──
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    nationality: { type: String, enum: ['Indian', 'Foreign', ''], default: 'Indian' },
    collegeIdNo: { type: String, trim: true, default: '' },
    aadhaarNo: { type: String, trim: true, default: '' },
    passportNo: { type: String, trim: true, default: '' },
    visaNo: { type: String, trim: true, default: '' },
    photoUrl: { type: String, default: '' },
    studentPassword: { type: String, select: false, default: '' },

    // ── Second Tenant info ──
    secondTenant: {
      type: {
        name: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
        nationality: { type: String, enum: ['Indian', 'Foreign', ''], default: 'Indian' },
        collegeIdNo: { type: String, trim: true, default: '' },
        aadhaarNo: { type: String, trim: true, default: '' },
        passportNo: { type: String, trim: true, default: '' },
        visaNo: { type: String, trim: true, default: '' },
        photoUrl: { type: String, default: '' },
      },
      default: null,
    },

    // ── Student Directory (opt-in) ──
    studentCourse: { type: String, default: '', trim: true },
    studentYear: { type: String, default: '', trim: true },
    directoryOptIn: { type: Boolean, default: false },

    // ── Lead Source ──
    leadSource: {
      type: String,
      enum: ['instagram', 'google', 'whatsapp', 'banner', 'referral', 'walk-in', 'other', ''],
      default: '',
    },

    // ── Lease / Finance ──
    checkinDate: { type: String, default: '' },
    agreementEndDate: { type: String, default: '' },
    rentAmount: { type: Number, default: 0 },
    maintCharge: { type: Number, default: 300 },
    securityDeposit: { type: Number, default: 0 },

    // ── Payment status ──
    rentPaid: { type: Boolean, default: false },
    elecPaid: { type: Boolean, default: false },

    // ── UPI Payment Verification ──
    pendingPayments: {
      type: [
        {
          id: Number,
          type: { type: String, enum: ['rent', 'electricity'] },
          amount: Number,
          utrNumber: { type: String, default: '' },
          screenshotUrl: { type: String, default: '' },
          status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
          submittedAt: { type: String, default: '' },
          reviewedAt: { type: String, default: '' },
        },
      ],
      default: [],
    },

    // ── Electricity / Meter ──
    elecLast: { type: Number, default: 0 },
    elecCurrent: { type: Number, default: 0 },
    invLast: { type: Number, default: 0 },
    invCurrent: { type: Number, default: 0 },
    elecRate: { type: Number, default: 13 },

    // ── Meter Reading History (monthly readings array) ──
    meterHistory: {
      type: [
        {
          month: String,
          elecReading: Number,
          invReading: Number,
          totalUnits: Number,
          recordedAt: { type: String, default: '' },
        },
      ],
      default: [],
    },

    // ── Documents (Document Vault) ──
    doc1Url: { type: String, default: '' },
    doc1Verified: { type: Boolean, default: false },
    doc2Url: { type: String, default: '' },
    doc2Verified: { type: Boolean, default: false },
    // Additional document vault fields
    aadhaarUrl: { type: String, default: '' },
    aadhaarVerified: { type: Boolean, default: false },
    universityIdUrl: { type: String, default: '' },
    universityIdVerified: { type: Boolean, default: false },
    rentalAgreementUrl: { type: String, default: '' },
    rentalAgreementSigned: { type: Boolean, default: false },

    // ── Amenities ──
    amenities: {
      type: [
        {
          name: String,
          enabled: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    // ── Tickets (maintenance) ──
    tickets: {
      type: [
        {
          id: Number,
          text: String,
          photoUrl: { type: String, default: '' },
          assignedTo: { type: String, default: '' },
          priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
          status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
          createdAt: { type: String, default: '' },
        },
      ],
      default: [],
    },

    // ── Complaints (submitted by tenant) ──
    complaints: {
      type: [
        {
          id: Number,
          text: String,
          photoUrl: { type: String, default: '' },
          status: { type: String, enum: ['open', 'resolved'], default: 'open' },
          createdAt: { type: String, default: '' },
        },
      ],
      default: [],
    },

    // ── Payment History ──
    paymentHistory: {
      type: [
        {
          type: { type: String, enum: ['rent', 'electricity'] },
          amount: Number,
          paidAt: String,
          month: String,
          utrNumber: { type: String, default: '' },
        },
      ],
      default: [],
    },

    // ── Move-Out Clearance ──
    clearance: {
      type: {
        billsCleared: { type: Boolean, default: false },
        keysReturned: { type: Boolean, default: false },
        roomInspected: { type: Boolean, default: false },
        damageNotes: { type: String, default: '' },
        depositRefunded: { type: Boolean, default: false },
        refundAmount: { type: Number, default: 0 },
        clearedAt: { type: String, default: '' },
      },
      default: null,
    },

    // ── Emergency Contact (Guardian) ──
    guardianName: { type: String, trim: true, default: '' },
    guardianPhone: { type: String, trim: true, default: '' },
    guardianRelation: { type: String, trim: true, default: '' },

    // ── Notice Period ──
    noticePeriod: {
      type: {
        active: { type: Boolean, default: false },
        submittedAt: { type: String, default: '' },
        endDate: { type: String, default: '' },
        reason: { type: String, default: '' },
      },
      default: null,
    },

    // ── Tenant Feedback (post-checkout) ──
    feedback: {
      type: {
        rating: { type: Number, min: 1, max: 5, default: 0 },
        review: { type: String, default: '' },
        submittedAt: { type: String, default: '' },
      },
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index: one room per building
roomSchema.index({ buildingId: 1, roomNo: 1 }, { unique: true });

// ── Hash studentPassword before save ──
roomSchema.pre('save', async function (next) {
  if (!this.isModified('studentPassword') || !this.studentPassword) return next();
  const salt = await bcrypt.genSalt(10);
  this.studentPassword = await bcrypt.hash(this.studentPassword, salt);
  next();
});

// ── Compare password helper ──
roomSchema.methods.matchPassword = async function (entered) {
  if (!this.studentPassword) return false;
  return bcrypt.compare(entered, this.studentPassword);
};

module.exports = mongoose.model('Room', roomSchema);
