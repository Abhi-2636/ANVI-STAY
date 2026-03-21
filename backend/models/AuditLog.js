/**
 * AuditLog Model – Tracks admin/system activities
 */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'admin_login', 'admin_logout', 'admin_created', 'admin_updated', 'admin_deleted',
            'room_created', 'room_updated', 'room_deleted', 'room_vacated',
            'tenant_checkin', 'tenant_checkout', 'tenant_login',
            'payment_submitted', 'payment_approved', 'payment_rejected',
            'complaint_submitted', 'complaint_resolved',
            'ticket_created', 'ticket_resolved',
            'notice_created', 'notice_updated', 'notice_deleted',
            'booking_created', 'booking_updated', 'booking_deleted',
            'agreement_created', 'agreement_signed', 'agreement_deleted',
            'housekeeping_created', 'housekeeping_updated',
            'config_updated', 'billing_generated', 'meter_reading',
            'file_uploaded', 'email_sent', 'whatsapp_sent',
            'system_event',
        ],
    },
    performedBy: {
        type: String,  // Admin name/email or 'system' or tenant identifier
        default: 'system',
    },
    performedByRole: {
        type: String,
        enum: ['superadmin', 'admin', 'manager', 'tenant', 'system'],
        default: 'system',
    },
    targetType: {
        type: String,  // 'room', 'booking', 'agreement', 'notice', etc.
        default: '',
    },
    targetId: {
        type: String,  // The ID or identifier of the affected resource
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Any additional data
        default: {},
    },
    ipAddress: {
        type: String,
        default: '',
    },
}, { timestamps: true });

// Index for fast querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
