const Room = require('../models/Room');
const Maintenance = require('../models/Maintenance');
const { sendWhatsAppReceipt } = require('../utils/whatsapp');
const { logAction } = require('./auditController');

// Fields to exclude from tenant-facing responses
const SENSITIVE_FIELDS = ['aadhaarNo', 'passportNo', 'visaNo', 'aadhaarUrl', 'studentPassword'];

function sanitizeForTenant(roomObj) {
  const data = typeof roomObj.toObject === 'function' ? roomObj.toObject() : { ...roomObj };
  SENSITIVE_FIELDS.forEach(f => delete data[f]);
  return data;
}

// ──────────────────────────────────────
// @route   GET /api/rooms/availability
// @desc    Get real-time room availability per building (public)
// @access  Public
// ──────────────────────────────────────
exports.getAvailability = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$buildingId',
          total: { $sum: 1 },
          vacant: {
            $sum: { $cond: [{ $eq: ['$status', 'Vacant'] }, 1, 0] },
          },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] },
          },
          booked: {
            $sum: { $cond: [{ $eq: ['$status', 'Booked'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await Room.aggregate(pipeline);

    // Convert to a map for easy frontend lookup: { buildingId: { total, vacant, occupied, booked } }
    const availability = {};
    result.forEach((r) => {
      availability[r._id] = {
        total: r.total,
        vacant: r.vacant,
        occupied: r.occupied,
        booked: r.booked,
        available: r.vacant + r.booked, // rooms that can still be claimed
        occupancyPct: r.total > 0 ? Math.round((r.occupied / r.total) * 100) : 0,
      };
    });

    res.status(200).json({ success: true, data: availability });
  } catch (err) {
    console.error('[roomController] getAvailability error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/rooms/tenant-login
// @desc    Tenant login with building, room & password
// @access  Public
// ──────────────────────────────────────
exports.tenantLogin = async (req, res) => {
  try {
    const { buildingId, roomNo, password } = req.body;

    if (!buildingId || !roomNo || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const room = await Room.findOne({ buildingId, roomNo }).select('+studentPassword');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found. Contact admin.' });
    }

    const isMatch = await room.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Return sanitized room data (no sensitive fields)
    const data = sanitizeForTenant(room);

    // Fetch maintenance tickets to show in the portal as complaints
    const tickets = await Maintenance.find({ buildingId, roomNo }).sort('-createdAt');
    data.complaints = tickets.map((t) => ({
      id: t._id,
      text: t.description,
      status: t.status,
      createdAt: t.createdAt,
    }));

    // Audit log
    await logAction({
      action: 'tenant_login',
      performedBy: room.name || 'tenant',
      performedByRole: 'tenant',
      targetType: 'room',
      targetId: `${buildingId}-${roomNo}`,
      description: `Tenant login for ${buildingId} Room ${roomNo}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[roomController] tenantLogin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms
// @desc    Get all rooms (admin)
// @access  Private
// ──────────────────────────────────────
exports.getRooms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.buildingId) filter.buildingId = req.query.buildingId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.rentPaid !== undefined) filter.rentPaid = req.query.rentPaid === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 200;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      Room.find(filter).sort('buildingId roomNo').skip(skip).limit(limit),
      Room.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: rooms,
    });
  } catch (err) {
    console.error('[roomController] getRooms error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms/:buildingId/:roomNo
// @desc    Get single room
// @access  Private
// ──────────────────────────────────────
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({
      buildingId: req.params.buildingId,
      roomNo: Number(req.params.roomNo),
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    console.error('[roomController] getRoom error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   PUT /api/rooms/:buildingId/:roomNo
// @desc    Create / Update room (upsert)
// @access  Private (admin)
// ──────────────────────────────────────
exports.upsertRoom = async (req, res) => {
  try {
    const { buildingId, roomNo } = req.params;
    const update = { ...req.body, buildingId, roomNo: Number(roomNo) };

    // Handle password hashing via the model pre-save hook
    let room = await Room.findOne({ buildingId, roomNo: Number(roomNo) });
    if (room) {
      // Update existing
      Object.assign(room, update);
      await room.save();
    } else {
      // Create new
      room = await Room.create(update);
    }

    // Audit log
    await logAction({
      action: room.isNew ? 'room_created' : 'room_updated',
      performedBy: req.admin?.name || 'admin',
      performedByRole: req.admin?.role || 'admin',
      targetType: 'room',
      targetId: `${buildingId}-${roomNo}`,
      description: `Room ${buildingId}-${roomNo} ${room.isNew ? 'created' : 'updated'}`,
      ipAddress: req.ip,
    });

    // Return without password
    const data = room.toObject();
    delete data.studentPassword;
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[roomController] upsertRoom error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   DELETE /api/rooms/:buildingId/:roomNo
// @desc    Delete / vacate a room
// @access  Private (admin)
// ──────────────────────────────────────
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({
      buildingId: req.params.buildingId,
      roomNo: Number(req.params.roomNo),
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    await logAction({
      action: 'room_deleted',
      performedBy: req.admin?.name || 'admin',
      performedByRole: req.admin?.role || 'admin',
      targetType: 'room',
      targetId: `${req.params.buildingId}-${req.params.roomNo}`,
      description: `Room ${req.params.buildingId}-${req.params.roomNo} vacated and deleted`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Room vacated and record removed.' });
  } catch (err) {
    console.error('[roomController] deleteRoom error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms/dashboard-stats
// @desc    Get aggregated stats for the admin dashboard (occupancy, revenue, dues)
// @access  Private (admin)
// ──────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const list = await Room.find({});
    let totalRooms = list.length;
    let occupiedCount = 0;
    let vacantCount = 0;
    let bookedCount = 0;
    let collectedRent = 0;
    let pendingRentCount = 0;
    let pendingElecCount = 0;

    list.forEach(r => {
      // Occupancy
      if (r.status === 'Occupied') occupiedCount++;
      else if (r.status === 'Booked') bookedCount++;
      else vacantCount++;

      // Revenue & Pending
      if (r.status === 'Occupied') {
        if (r.rentPaid) {
          collectedRent += (r.rentAmount || 0);
        } else {
          pendingRentCount++;
        }
        if (!r.elecPaid) {
          pendingElecCount++;
        }
      }
    });

    // Also get total open maintenance tickets
    const Maintenance = require('../models/Maintenance');
    const openTickets = await Maintenance.countDocuments({ status: { $in: ['open', 'in-progress'] } });

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        occupiedCount,
        vacantCount,
        bookedCount,
        collectedRent,
        pendingRentCount,
        pendingElecCount,
        openTickets
      }
    });
  } catch (err) {
    console.error('[roomController] getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/rooms/:buildingId/:roomNo/complaint
// @desc    Submit a complaint (tenant)
// @access  Public (verified via room password)
// ──────────────────────────────────────
exports.submitComplaint = async (req, res) => {
  try {
    const { buildingId, roomNo } = req.params;
    const { password, text, photoUrl } = req.body;

    if (!password || !text) {
      return res.status(400).json({ success: false, message: 'Password and complaint text are required.' });
    }

    const room = await Room.findOne({ buildingId, roomNo: Number(roomNo) }).select('+studentPassword');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const isMatch = await room.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    // Create a new Maintenance ticket
    await Maintenance.create({
      buildingId,
      roomNo: Number(roomNo),
      tenantName: room.name || 'Tenant',
      description: text,
      photoUrl: photoUrl || '',
      reportedBy: 'tenant',
    });

    // Return the sanitized room object (fresh tickets will be loaded on the next tenantLogin)
    const data = room.toObject();
    delete data.studentPassword;
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[roomController] submitComplaint error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/rooms/:buildingId/:roomNo/upi-verify
// @desc    Submit a UPI payment for verification (tenant)
// @access  Public (verified via room password)
// ──────────────────────────────────────
exports.submitUpiPayment = async (req, res) => {
  try {
    const { buildingId, roomNo } = req.params;
    const { password, type, amount, utrNumber, screenshotUrl, method } = req.body;

    if (!password || !type) {
      return res.status(400).json({ success: false, message: 'Password and payment type are required.' });
    }

    if (method !== 'cash' && !utrNumber) {
      return res.status(400).json({ success: false, message: 'UTR number is required for UPI payments.' });
    }

    const room = await Room.findOne({ buildingId, roomNo: Number(roomNo) }).select('+studentPassword');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const isMatch = await room.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const payment = {
      id: Date.now(),
      type,
      method: method || 'upi',
      amount: amount || 0,
      utrNumber: utrNumber || (method === 'cash' ? 'CASH' : ''),
      screenshotUrl: screenshotUrl || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    room.pendingPayments.push(payment);
    await room.save();

    const data = room.toObject();
    delete data.studentPassword;
    res.status(201).json({ success: true, data, message: 'Payment submitted for verification.' });
  } catch (err) {
    console.error('[roomController] submitUpiPayment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   PUT /api/rooms/:buildingId/:roomNo/upi-verify/:paymentId
// @desc    Approve or reject a UPI payment (admin)
// @access  Private (admin)
// ──────────────────────────────────────
exports.reviewUpiPayment = async (req, res) => {
  try {
    const { buildingId, roomNo, paymentId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const room = await Room.findOne({ buildingId, roomNo: Number(roomNo) });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const payment = room.pendingPayments.find(p => p.id === Number(paymentId));
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });

    payment.status = status;
    payment.reviewedAt = new Date().toISOString();

    // If approved, mark the corresponding payment as paid and add to history
    if (status === 'approved') {
      if (payment.type === 'rent') room.rentPaid = true;
      if (payment.type === 'electricity') room.elecPaid = true;

      const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      room.paymentHistory.push({
        type: payment.type,
        method: payment.method || 'upi',
        amount: payment.amount,
        paidAt: new Date().toISOString(),
        month: monthLabel,
        utrNumber: payment.utrNumber,
      });

      // Send automated WhatsApp Receipt
      const phone = room.phone || '9142272776';
      const name = room.name || 'Tenant';
      const roomInfo = `${room.buildingId}-${room.roomNo}`;
      await sendWhatsAppReceipt(phone, name, payment.amount, monthLabel, roomInfo);

      // Send email receipt too
      try {
        const { sendEmail } = require('./emailController');
        // If we had tenant email, send receipt
      } catch (e) { /* email optional */ }
    }

    // Audit log
    await logAction({
      action: status === 'approved' ? 'payment_approved' : 'payment_rejected',
      performedBy: req.admin?.name || 'admin',
      performedByRole: req.admin?.role || 'admin',
      targetType: 'room',
      targetId: `${buildingId}-${roomNo}`,
      description: `Payment ${paymentId} ${status} for ${buildingId}-${roomNo} (₹${payment.amount})`,
      metadata: { paymentType: payment.type, amount: payment.amount, utr: payment.utrNumber },
      ipAddress: req.ip,
    });

    await room.save();
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    console.error('[roomController] reviewUpiPayment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/rooms/:buildingId/:roomNo/guest
// @desc    Register a guest (tenant, verified via password)
// @access  Public
// ──────────────────────────────────────
exports.registerGuest = async (req, res) => {
  try {
    const { buildingId, roomNo } = req.params;
    const { password, guestName, guestIdNumber, duration } = req.body;

    if (!password || !guestName) {
      return res.status(400).json({ success: false, message: 'Password and guest name are required.' });
    }

    const room = await Room.findOne({ buildingId, roomNo: Number(roomNo) }).select('+studentPassword');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const isMatch = await room.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    // Forward to Guest model
    const Guest = require('../models/Guest');
    const guest = await Guest.create({ buildingId, roomNo: Number(roomNo), guestName, guestIdNumber, duration });
    res.status(201).json({ success: true, data: guest, message: 'Guest registered successfully.' });
  } catch (err) {
    console.error('[roomController] registerGuest error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms/analytics/revenue
// @desc    Get comprehensive analytics (admin)
// @access  Private
// ──────────────────────────────────────
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const rooms = await Room.find();
    const monthlyRevenue = {};
    const leadSources = {};
    const buildingStats = {};
    const electricityData = {};
    let totalOccupied = 0;
    let totalVacant = 0;
    let totalBooked = 0;
    let totalRent = 0;
    let totalDeposits = 0;
    let totalUnpaidRent = 0;
    let totalUnpaidElec = 0;
    const tenantDurations = [];
    const monthlyOccupancy = {};

    rooms.forEach(r => {
      // Occupancy counts
      if (r.status === 'Occupied') totalOccupied++;
      else if (r.status === 'Vacant') totalVacant++;
      else if (r.status === 'Booked') totalBooked++;

      // Per-building stats
      if (!buildingStats[r.buildingId]) {
        buildingStats[r.buildingId] = { occupied: 0, vacant: 0, booked: 0, revenue: 0, rooms: 0 };
      }
      buildingStats[r.buildingId].rooms++;
      if (r.status === 'Occupied') {
        buildingStats[r.buildingId].occupied++;
        totalRent += r.rentAmount || 0;
        totalDeposits += r.securityDeposit || 0;
        if (!r.rentPaid) totalUnpaidRent += r.rentAmount || 0;
        if (!r.elecPaid) {
          const units = Math.max(0, (r.elecCurrent || 0) - (r.elecLast || 0)) + Math.max(0, (r.invCurrent || 0) - (r.invLast || 0));
          totalUnpaidElec += units * (r.elecRate || 13) + (r.maintCharge || 300);
        }
      } else if (r.status === 'Vacant') {
        buildingStats[r.buildingId].vacant++;
      } else {
        buildingStats[r.buildingId].booked++;
      }

      // Payment history aggregation
      (r.paymentHistory || []).forEach(p => {
        const key = p.month || 'Unknown';
        if (!monthlyRevenue[key]) monthlyRevenue[key] = 0;
        monthlyRevenue[key] += Number(p.amount) || 0;
        buildingStats[r.buildingId].revenue += Number(p.amount) || 0;
      });

      // Lead source aggregation
      if (r.leadSource) {
        if (!leadSources[r.leadSource]) leadSources[r.leadSource] = 0;
        leadSources[r.leadSource]++;
      }

      // Tenant duration analysis
      if (r.checkinDate && r.status === 'Occupied') {
        const checkin = new Date(r.checkinDate);
        const now = new Date();
        const months = Math.floor((now - checkin) / (1000 * 60 * 60 * 24 * 30));
        tenantDurations.push({ buildingId: r.buildingId, roomNo: r.roomNo, months });
      }

      // Electricity consumption per building
      if (r.status === 'Occupied') {
        const units = Math.max(0, (r.elecCurrent || 0) - (r.elecLast || 0)) + Math.max(0, (r.invCurrent || 0) - (r.invLast || 0));
        if (!electricityData[r.buildingId]) electricityData[r.buildingId] = { totalUnits: 0, rooms: 0, totalCost: 0 };
        electricityData[r.buildingId].totalUnits += units;
        electricityData[r.buildingId].rooms++;
        electricityData[r.buildingId].totalCost += units * (r.elecRate || 13);
      }
    });

    // Revenue data for charting
    const revenueData = Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount }));
    const leadData = Object.entries(leadSources).map(([source, count]) => ({ source, count }));

    // Average tenant duration
    const avgDuration = tenantDurations.length > 0
      ? Math.round(tenantDurations.reduce((s, t) => s + t.months, 0) / tenantDurations.length)
      : 0;

    // Revenue forecast (based on current occupancy)
    const projectedMonthlyRevenue = totalRent;
    const projectedAnnualRevenue = totalRent * 12;

    // Occupancy rate
    const occupancyRate = rooms.length > 0 ? Math.round((totalOccupied / rooms.length) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        revenueData,
        leadData,
        totalRooms: rooms.length,
        occupancy: { occupied: totalOccupied, vacant: totalVacant, booked: totalBooked, rate: occupancyRate },
        financial: {
          totalMonthlyRent: totalRent,
          totalDeposits,
          totalUnpaidRent,
          totalUnpaidElec,
          projectedMonthlyRevenue,
          projectedAnnualRevenue,
        },
        buildingStats,
        electricityData,
        tenantRetention: { avgDurationMonths: avgDuration, totalActive: tenantDurations.length },
      },
    });
  } catch (err) {
    console.error('[roomController] getRevenueAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms/directory
// @desc    Get student directory (opted-in students)
// @access  Public
// ──────────────────────────────────────
exports.getStudentDirectory = async (req, res) => {
  try {
    const students = await Room.find(
      { directoryOptIn: true, status: 'Occupied' },
      'name buildingId roomNo studentCourse studentYear'
    ).sort('buildingId roomNo');
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    console.error('[roomController] getStudentDirectory error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/rooms/:buildingId/:roomNo/maintenance
// @desc    Add maintenance work ticket (admin)
// @access  Private (admin)
// ──────────────────────────────────────
exports.addMaintenanceWork = async (req, res) => {
  try {
    const { buildingId, roomNo } = req.params;
    const { text, priority, assignedTo, photoUrl } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Maintenance work description is required.' });
    }

    const room = await Room.findOne({ buildingId, roomNo: Number(roomNo) });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const ticket = {
      id: Date.now(),
      text,
      photoUrl: photoUrl || '',
      assignedTo: assignedTo || '',
      priority: priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    room.tickets.push(ticket);
    await room.save();

    await logAction(req.admin?.name || 'Admin', 'maintenance', `Added maintenance: "${text}" to ${buildingId} Room ${roomNo}`);

    res.status(201).json({ success: true, data: room, ticket });
  } catch (err) {
    console.error('[roomController] addMaintenanceWork error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   PUT /api/rooms/:buildingId/:roomNo/maintenance/:ticketId
// @desc    Update maintenance ticket status (admin)
// @access  Private (admin)
// ──────────────────────────────────────
exports.updateMaintenanceWork = async (req, res) => {
  try {
    const { buildingId, roomNo, ticketId } = req.params;
    const { status, assignedTo, priority } = req.body;

    const room = await Room.findOne({ buildingId, roomNo: Number(roomNo) });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const ticket = room.tickets.find(t => t.id === Number(ticketId));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    if (status) ticket.status = status;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    if (priority) ticket.priority = priority;

    await room.save();

    await logAction(req.admin?.name || 'Admin', 'maintenance', `Updated ticket #${ticketId} in ${buildingId} Room ${roomNo}: ${status || 'updated'}`);

    res.status(200).json({ success: true, data: room, ticket });
  } catch (err) {
    console.error('[roomController] updateMaintenanceWork error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/rooms/swap
// @desc    Swap/Transfer tenant between rooms
// @access  Private (Admin)
// ──────────────────────────────────────
exports.swapRoom = async (req, res) => {
  try {
    const { fromBuildingId, fromRoomNo, toBuildingId, toRoomNo } = req.body;
    const fromRoom = await Room.findOne({ buildingId: fromBuildingId, roomNo: fromRoomNo }).select('+studentPassword');
    const toRoom = await Room.findOne({ buildingId: toBuildingId, roomNo: toRoomNo });

    if (!fromRoom || !toRoom) return res.status(404).json({ success: false, message: 'Room not found' });
    if (toRoom.status === 'Occupied') return res.status(400).json({ success: false, message: 'Target room is already occupied' });
    if (fromRoom.status !== 'Occupied') return res.status(400).json({ success: false, message: 'Source room has no tenant' });

    // Transfer tenant data
    const tenantFields = [
      'name', 'phone', 'nationality', 'collegeIdNo', 'aadhaarNo', 'passportNo', 'visaNo',
      'photoUrl', 'studentPassword', 'secondTenant', 'studentCourse', 'studentYear',
      'directoryOptIn', 'leadSource', 'checkinDate', 'agreementEndDate', 'rentAmount',
      'maintCharge', 'securityDeposit', 'rentPaid', 'elecPaid', 'amenities',
      'doc1Url', 'doc1Verified', 'doc2Url', 'doc2Verified', 'aadhaarUrl', 'aadhaarVerified',
      'universityIdUrl', 'universityIdVerified', 'rentalAgreementUrl', 'rentalAgreementSigned',
      'guardianName', 'guardianPhone', 'guardianRelation', 'paymentHistory',
    ];

    tenantFields.forEach((f) => { toRoom[f] = fromRoom[f]; });
    toRoom.status = 'Occupied';

    // Clear source room
    tenantFields.forEach((f) => {
      if (typeof fromRoom[f] === 'boolean') fromRoom[f] = false;
      else if (typeof fromRoom[f] === 'number') fromRoom[f] = 0;
      else if (Array.isArray(fromRoom[f])) fromRoom[f] = [];
      else fromRoom[f] = fromRoom.schema.path(f)?.default?.() ?? '';
    });
    fromRoom.status = 'Vacant';
    fromRoom.name = '';
    fromRoom.phone = '';
    fromRoom.studentPassword = '';

    await Promise.all([fromRoom.save(), toRoom.save()]);

    await logAction(req.admin?.name || 'Admin', 'room', `Transferred tenant from ${fromBuildingId}/${fromRoomNo} to ${toBuildingId}/${toRoomNo}`);

    res.json({ success: true, message: 'Tenant transferred successfully' });
  } catch (err) {
    console.error('[roomController] swapRoom error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   PUT /api/rooms/:buildingId/:roomNo/notice
// @desc    Submit/Cancel notice period
// @access  Private
// ──────────────────────────────────────
exports.submitNoticePeriod = async (req, res) => {
  try {
    const { buildingId, roomNo } = req.params;
    const { action, reason } = req.body; // action: 'submit' or 'cancel'
    const room = await Room.findOne({ buildingId, roomNo });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (action === 'submit') {
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      room.noticePeriod = {
        active: true,
        submittedAt: now.toISOString(),
        endDate: endDate.toISOString().split('T')[0],
        reason: reason || '',
      };
      await logAction(req.admin?.name || room.name || 'Tenant', 'notice', `Notice period submitted for ${buildingId} Room ${roomNo}`);
    } else {
      room.noticePeriod = null;
      await logAction(req.admin?.name || 'Admin', 'notice', `Notice period cancelled for ${buildingId} Room ${roomNo}`);
    }

    await room.save();
    res.json({ success: true, data: room.noticePeriod });
  } catch (err) {
    console.error('[roomController] submitNoticePeriod error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   POST /api/rooms/:buildingId/:roomNo/feedback
// @desc    Submit tenant feedback/rating
// @access  Public (tenant)
// ──────────────────────────────────────
exports.submitFeedback = async (req, res) => {
  try {
    const { buildingId, roomNo } = req.params;
    const { rating, review } = req.body;
    const room = await Room.findOne({ buildingId, roomNo });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    room.feedback = {
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      review: review || '',
      submittedAt: new Date().toISOString(),
    };

    await room.save();
    res.json({ success: true, message: 'Feedback submitted' });
  } catch (err) {
    console.error('[roomController] submitFeedback error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   PUT /api/rooms/bulk-price
// @desc    Update rent for all rooms in a building
// @access  Private (Admin)
// ──────────────────────────────────────
exports.bulkPriceUpdate = async (req, res) => {
  try {
    const { buildingId, newRent, newMaint } = req.body;
    if (!buildingId || !newRent) return res.status(400).json({ success: false, message: 'buildingId and newRent required' });

    const update = { rentAmount: Number(newRent) };
    if (newMaint !== undefined) update.maintCharge = Number(newMaint);

    const result = await Room.updateMany({ buildingId }, { $set: update });

    await logAction(req.admin?.name || 'Admin', 'billing', `Bulk price update for ${buildingId}: Rent ₹${newRent}${newMaint ? ', Maint ₹' + newMaint : ''} (${result.modifiedCount} rooms)`);

    res.json({ success: true, message: `Updated ${result.modifiedCount} rooms`, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('[roomController] bulkPriceUpdate error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms/document-expiry-alerts
// @desc    Get rooms with expiring documents (within 30 days)
// @access  Private (Admin)
// ──────────────────────────────────────
exports.getDocumentExpiryAlerts = async (req, res) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    // Find rooms where agreementEndDate is within the next 30 days
    const rooms = await Room.find({
      status: 'Occupied',
      agreementEndDate: { $ne: '', $lte: in30Days, $gte: today },
    }).select('buildingId roomNo name phone agreementEndDate').sort('agreementEndDate');

    // Also find already expired
    const expired = await Room.find({
      status: 'Occupied',
      agreementEndDate: { $ne: '', $lt: today },
    }).select('buildingId roomNo name phone agreementEndDate').sort('agreementEndDate');

    res.json({ success: true, data: { expiringSoon: rooms, expired } });
  } catch (err) {
    console.error('[roomController] getDocumentExpiryAlerts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms/revenue-report
// @desc    Revenue report per building with monthly breakdown
// @access  Private (Admin)
// ──────────────────────────────────────
exports.getRevenueReport = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'Occupied' }).select('buildingId roomNo name rentAmount maintCharge rentPaid elecPaid paymentHistory');

    // Group by building
    const report = {};
    rooms.forEach((r) => {
      if (!report[r.buildingId]) {
        report[r.buildingId] = { totalRent: 0, collected: 0, pending: 0, rooms: 0, tenants: [] };
      }
      const bld = report[r.buildingId];
      bld.rooms++;
      const monthly = (r.rentAmount || 0) + (r.maintCharge || 0);
      bld.totalRent += monthly;
      if (r.rentPaid) bld.collected += monthly;
      else bld.pending += monthly;
      bld.tenants.push({
        roomNo: r.roomNo, name: r.name,
        rent: r.rentAmount, maint: r.maintCharge,
        paid: r.rentPaid, totalPayments: (r.paymentHistory || []).length,
      });
    });

    // Overall totals
    let grandTotal = 0, grandCollected = 0, grandPending = 0;
    Object.values(report).forEach((b) => {
      grandTotal += b.totalRent;
      grandCollected += b.collected;
      grandPending += b.pending;
    });

    res.json({
      success: true,
      data: {
        buildings: report,
        summary: { totalExpected: grandTotal, totalCollected: grandCollected, totalPending: grandPending },
      },
    });
  } catch (err) {
    console.error('[roomController] getRevenueReport error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ──────────────────────────────────────
// @route   GET /api/rooms/feedback-summary
// @desc    Get average ratings per building
// @access  Public
// ──────────────────────────────────────
exports.getFeedbackSummary = async (req, res) => {
  try {
    const pipeline = [
      { $match: { 'feedback.rating': { $gte: 1 } } },
      {
        $group: {
          _id: '$buildingId',
          avgRating: { $avg: '$feedback.rating' },
          totalReviews: { $sum: 1 },
          reviews: { $push: { name: '$name', rating: '$feedback.rating', review: '$feedback.review', date: '$feedback.submittedAt' } },
        }
      },
      { $sort: { avgRating: -1 } },
    ];
    const result = await Room.aggregate(pipeline);
    const summary = {};
    result.forEach((r) => {
      summary[r._id] = { avgRating: Math.round(r.avgRating * 10) / 10, totalReviews: r.totalReviews, reviews: r.reviews.slice(0, 5) };
    });
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('[roomController] getFeedbackSummary:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
