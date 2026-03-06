/**
 * Email Controller – Send emails (receipts, reminders, booking confirmations)
 */
const nodemailer = require('nodemailer');
const { logAction } = require('./auditController');

// ── Create transporter ──
let transporter;
try {
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || '',
        },
    });
} catch (err) {
    console.warn('[Email] Transporter not configured. Emails will be mocked.');
}

// ── Email Templates ──
const templates = {
    paymentReceipt: (data) => ({
        subject: `✅ Payment Received – Room ${data.roomInfo} | ANVI STAY`,
        html: `
            <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                <div style="background:linear-gradient(135deg,#1e293b,#334155);padding:32px;text-align:center">
                    <h1 style="color:#c8a24a;margin:0;font-size:24px">ANVI STAY</h1>
                    <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;letter-spacing:2px">PAYMENT RECEIPT</p>
                </div>
                <div style="padding:32px">
                    <p style="color:#334155;font-size:16px">Hello <strong>${data.name}</strong>,</p>
                    <p style="color:#64748b;font-size:14px;line-height:1.6">
                        Thank you! We've received your payment. Here are the details:
                    </p>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
                        <table style="width:100%;border-collapse:collapse;font-size:14px">
                            <tr><td style="padding:8px 0;color:#64748b">Room</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#1e293b">${data.roomInfo}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Amount</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#10b981">₹${data.amount?.toLocaleString('en-IN')}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Type</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#1e293b">${data.type || 'Rent'}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Month</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#1e293b">${data.month}</td></tr>
                            ${data.utr ? `<tr><td style="padding:8px 0;color:#64748b">UTR</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#6366f1">${data.utr}</td></tr>` : ''}
                        </table>
                    </div>
                    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px">
                        © ${new Date().getFullYear()} ANVI STAY | Student Housing near LPU
                    </p>
                </div>
            </div>`,
    }),

    rentReminder: (data) => ({
        subject: `⏰ Rent Reminder – Room ${data.roomInfo} | ANVI STAY`,
        html: `
            <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px;text-align:center">
                    <h1 style="color:#fff;margin:0;font-size:24px">ANVI STAY</h1>
                    <p style="color:#fecaca;font-size:12px;margin:8px 0 0;letter-spacing:2px">PAYMENT REMINDER</p>
                </div>
                <div style="padding:32px">
                    <p style="color:#334155;font-size:16px">Hello <strong>${data.name}</strong>,</p>
                    <p style="color:#64748b;font-size:14px;line-height:1.6">
                        This is a gentle reminder that your payment for Room <strong>${data.roomInfo}</strong> is pending for <strong>${data.month}</strong>.
                    </p>
                    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
                        <p style="color:#64748b;font-size:12px;margin:0">Total Pending</p>
                        <p style="color:#dc2626;font-size:32px;font-weight:900;margin:8px 0">₹${data.amount?.toLocaleString('en-IN')}</p>
                    </div>
                    <p style="color:#64748b;font-size:14px;line-height:1.6">
                        Please clear the pending amount at your earliest convenience. If you've already paid, please share the payment proof.
                    </p>
                    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px">
                        © ${new Date().getFullYear()} ANVI STAY | Student Housing near LPU
                    </p>
                </div>
            </div>`,
    }),

    bookingConfirmation: (data) => ({
        subject: `🏠 Booking Confirmed – ${data.buildingName} | ANVI STAY`,
        html: `
            <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                <div style="background:linear-gradient(135deg,#059669,#10b981);padding:32px;text-align:center">
                    <h1 style="color:#fff;margin:0;font-size:24px">ANVI STAY</h1>
                    <p style="color:#a7f3d0;font-size:12px;margin:8px 0 0;letter-spacing:2px">BOOKING CONFIRMED</p>
                </div>
                <div style="padding:32px">
                    <p style="color:#334155;font-size:16px">Hello <strong>${data.name}</strong>,</p>
                    <p style="color:#64748b;font-size:14px;line-height:1.6">
                        Great news! Your room booking has been confirmed. Here are the details:
                    </p>
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0">
                        <table style="width:100%;border-collapse:collapse;font-size:14px">
                            <tr><td style="padding:8px 0;color:#64748b">Property</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#1e293b">${data.buildingName}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Room Type</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#1e293b">${data.roomType || 'Standard'}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Check-in</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#1e293b">${data.checkinDate}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Rent</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#10b981">₹${data.rent}/month</td></tr>
                        </table>
                    </div>
                    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px">
                        © ${new Date().getFullYear()} ANVI STAY | Student Housing near LPU
                    </p>
                </div>
            </div>`,
    }),

    welcomeTenant: (data) => ({
        subject: `🎉 Welcome to ANVI STAY – Room ${data.roomInfo}`,
        html: `
            <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                <div style="background:linear-gradient(135deg,#c8a24a,#e8c94a);padding:32px;text-align:center">
                    <h1 style="color:#1e293b;margin:0;font-size:28px;font-weight:900">Welcome! 🏠</h1>
                    <p style="color:#475569;font-size:12px;margin:8px 0 0;letter-spacing:2px;font-weight:700">ANVI STAY</p>
                </div>
                <div style="padding:32px">
                    <p style="color:#334155;font-size:16px">Hello <strong>${data.name}</strong>,</p>
                    <p style="color:#64748b;font-size:14px;line-height:1.6">
                        Welcome to your new home at <strong>ANVI STAY</strong>! We're thrilled to have you as part of our community.
                    </p>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
                        <p style="color:#1e293b;font-weight:700;margin:0 0 12px">Your Room Details:</p>
                        <table style="width:100%;border-collapse:collapse;font-size:14px">
                            <tr><td style="padding:6px 0;color:#64748b">Room</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#1e293b">${data.roomInfo}</td></tr>
                            <tr><td style="padding:6px 0;color:#64748b">Monthly Rent</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#1e293b">₹${data.rent}/month</td></tr>
                            <tr><td style="padding:6px 0;color:#64748b">Check-in Date</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#1e293b">${data.checkinDate}</td></tr>
                        </table>
                    </div>
                    <p style="color:#64748b;font-size:14px;line-height:1.6">
                        You can access your <strong>Student Portal</strong> anytime to view your room details, payment history, and submit maintenance requests.
                    </p>
                    <p style="color:#64748b;font-size:14px;line-height:1.6">
                        Need help? Reach us on WhatsApp: <strong>+91 9142272776</strong>
                    </p>
                    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px">
                        We Listen • We Care • You Stay<br/>
                        © ${new Date().getFullYear()} ANVI STAY
                    </p>
                </div>
            </div>`,
    }),
};

// ── Send Email Helper ──
async function sendEmail(to, template, data) {
    const { subject, html } = templates[template](data);

    if (!process.env.EMAIL_USER || !transporter) {
        console.log(`[Email MOCK] To: ${to} | Subject: ${subject}`);
        console.log(`[Email MOCK] Template: ${template}`);
        return { success: true, mocked: true };
    }

    try {
        await transporter.sendMail({
            from: `"ANVI STAY" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        await logAction({
            action: 'email_sent',
            performedBy: 'system',
            performedByRole: 'system',
            targetType: 'email',
            targetId: to,
            description: `Sent ${template} email to ${to}`,
            metadata: { template, subject },
        });

        return { success: true, mocked: false };
    } catch (err) {
        console.error('[Email] Send failed:', err.message);
        return { success: false, error: err.message };
    }
}

exports.sendEmail = sendEmail;

// ──────────────────────────────────────
// @route   POST /api/email/send
// @desc    Send an email manually (admin)
// @access  Private (admin)
// ──────────────────────────────────────
exports.sendManualEmail = async (req, res) => {
    try {
        const { to, template, data } = req.body;

        if (!to || !template) {
            return res.status(400).json({ success: false, message: 'to and template are required' });
        }

        if (!templates[template]) {
            return res.status(400).json({
                success: false,
                message: `Invalid template. Available: ${Object.keys(templates).join(', ')}`,
            });
        }

        const result = await sendEmail(to, template, data || {});
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('[emailController] sendManualEmail error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ──────────────────────────────────────
// @route   POST /api/email/bulk-reminder
// @desc    Send rent reminders to all unpaid tenants
// @access  Private (admin)
// ──────────────────────────────────────
exports.sendBulkReminder = async (req, res) => {
    try {
        const Room = require('../models/Room');
        const rooms = await Room.find({ status: 'Occupied', rentPaid: false });
        let sent = 0;
        const errors = [];

        for (const room of rooms) {
            if (room.phone) {
                // Try to find an email — for now we'd need it stored
                // For demonstration, we log to console
                const roomInfo = `${room.buildingId}-${room.roomNo}`;
                const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
                console.log(`[Email Bulk] Would send reminder to ${room.name} (${room.phone}) for ${roomInfo}`);
                sent++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${sent} reminders out of ${rooms.length} unpaid tenants`,
        });
    } catch (err) {
        console.error('[emailController] sendBulkReminder error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
