/**
 * cronJobs.js – Automated tasks for Anvi Stay
 *
 * 1. Daily 10 AM – Rent reminder via WhatsApp
 * 2. 1st of every month – Auto-generate billing, reset payment flags, carry over dues
 * 3. Daily 9 AM – Check for expiring agreements
 */
const cron = require('node-cron');
const Room = require('./models/Room');
const Billing = require('./models/Billing');
const Agreement = require('./models/Agreement');
const { sendWhatsAppReminder } = require('./utils/whatsapp');
const { logAction } = require('./controllers/auditController');

module.exports = function initializeCronJobs() {

    // ══════════════════════════════════════
    // CRON 1: Daily rent reminders at 10 AM
    // ══════════════════════════════════════
    cron.schedule('0 10 * * *', async () => {
        console.log('[CRON] Starting daily dues reminder at 10:00 AM...');
        try {
            const occupiedRooms = await Room.find({ status: 'Occupied' });
            const now = new Date();
            let reminderCount = 0;

            for (const room of occupiedRooms) {
                if (!room.rentPaid || !room.elecPaid) {
                    const eCurr = room.elecCurrent || 0;
                    const eLast = room.elecLast || 0;
                    const iCurr = room.invCurrent || 0;
                    const iLast = room.invLast || 0;
                    const delta = Math.max(0, eCurr - eLast) + Math.max(0, iCurr - iLast);
                    const rate = room.elecRate || 13;
                    let totalDue = (delta * rate);
                    if (!room.rentPaid) totalDue += (room.rentAmount || 0);

                    if (totalDue > 0) {
                        const phone = room.phone || '9142272776';
                        const name = room.name || 'Tenant';
                        const roomInfo = `${room.buildingId}-${room.roomNo}`;
                        const monthStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });

                        await sendWhatsAppReminder(phone, name, totalDue, monthStr, roomInfo);
                        reminderCount++;
                    }
                }
            }

            console.log(`[CRON] Daily reminder done. Sent ${reminderCount} reminders.`);

            await logAction({
                action: 'system_event',
                performedBy: 'system',
                performedByRole: 'system',
                description: `Daily rent reminders sent to ${reminderCount} tenants`,
            });
        } catch (error) {
            console.error('[CRON] Error running daily reminder:', error);
        }
    });

    // ══════════════════════════════════════
    // CRON 2: Monthly billing on 1st at 12:01 AM
    // ══════════════════════════════════════
    cron.schedule('1 0 1 * *', async () => {
        console.log('[CRON] Starting monthly billing generation...');
        try {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const prevMonth = now.getMonth() === 0
                ? `${now.getFullYear() - 1}-12`
                : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

            const occupiedRooms = await Room.find({ status: 'Occupied' });
            let generated = 0;

            for (const room of occupiedRooms) {
                // Check if bill already exists for this month
                const existing = await Billing.findOne({
                    buildingId: room.buildingId,
                    roomNo: room.roomNo,
                    month,
                });
                if (existing) continue;

                // Calculate previous month dues
                let previousDues = 0;
                const prevBill = await Billing.findOne({
                    buildingId: room.buildingId,
                    roomNo: room.roomNo,
                    month: prevMonth,
                });
                if (prevBill && prevBill.balance > 0) {
                    previousDues = prevBill.balance;
                }

                // Calculate electricity
                const elecUnits = Math.max(0, (room.elecCurrent || 0) - (room.elecLast || 0))
                    + Math.max(0, (room.invCurrent || 0) - (room.invLast || 0));
                const elecAmount = elecUnits * (room.elecRate || 13);

                const rentAmount = room.rentAmount || 0;
                const maintCharge = room.maintCharge || 300;
                const totalAmount = rentAmount + elecAmount + maintCharge + previousDues;

                // Create billing record
                await Billing.create({
                    buildingId: room.buildingId,
                    roomNo: room.roomNo,
                    tenantName: room.name || '',
                    tenantPhone: room.phone || '',
                    month,
                    year: now.getFullYear(),
                    rentAmount,
                    elecUnits,
                    elecRate: room.elecRate || 13,
                    elecAmount,
                    maintCharge,
                    previousDues,
                    totalAmount,
                    balance: totalAmount,
                    dueDate: new Date(now.getFullYear(), now.getMonth(), 5), // due by 5th
                });

                // Reset payment flags for the new month
                room.rentPaid = false;
                room.elecPaid = false;

                // Record meter reading in history
                room.meterHistory.push({
                    month,
                    elecReading: room.elecCurrent || 0,
                    invReading: room.invCurrent || 0,
                    totalUnits: elecUnits,
                    recordedAt: new Date().toISOString(),
                });

                // Shift current to last for next month
                room.elecLast = room.elecCurrent || 0;
                room.invLast = room.invCurrent || 0;

                await room.save();
                generated++;
            }

            console.log(`[CRON] Monthly billing done. Generated ${generated} bills for ${month}.`);

            await logAction({
                action: 'billing_generated',
                performedBy: 'system',
                performedByRole: 'system',
                description: `Monthly billing generated for ${month}: ${generated} bills created`,
                metadata: { month, count: generated },
            });
        } catch (error) {
            console.error('[CRON] Error generating monthly billing:', error);
        }
    });

    // ══════════════════════════════════════
    // CRON 3: Check expiring agreements daily at 9 AM
    // ══════════════════════════════════════
    cron.schedule('0 9 * * *', async () => {
        console.log('[CRON] Checking for expiring agreements...');
        try {
            const now = new Date();
            const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const expiring = await Agreement.find({
                status: { $in: ['fully-signed', 'tenant-signed'] },
                endDate: {
                    $lte: sevenDays.toISOString().split('T')[0],
                    $gte: now.toISOString().split('T')[0],
                },
            });

            if (expiring.length > 0) {
                console.log(`[CRON] Found ${expiring.length} agreements expiring within 7 days.`);

                // Send WhatsApp notification for each expiring agreement
                for (const agreement of expiring) {
                    try {
                        const room = await Room.findOne({
                            buildingId: agreement.buildingId,
                            roomNo: agreement.roomNo,
                            status: 'Occupied',
                        });

                        if (room && room.phone) {
                            const endDate = new Date(agreement.endDate);
                            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                            const roomInfo = `${agreement.buildingId}-${agreement.roomNo}`;
                            const message = `Agreement Expiry Alert`;

                            await sendWhatsAppReminder(
                                room.phone,
                                room.name || 'Tenant',
                                0, // amount not applicable here
                                `Agreement for Room ${roomInfo} expires in ${daysLeft} day(s) on ${endDate.toLocaleDateString('en-IN')}. Please contact the owner to renew.`,
                                roomInfo
                            );

                            // Mark as reminded to avoid re-sending
                            agreement.renewalReminded = true;
                            await agreement.save();
                        }
                    } catch (notifyErr) {
                        console.error(`[CRON] Failed to notify for agreement ${agreement._id}:`, notifyErr.message);
                    }
                }

                await logAction({
                    action: 'system_event',
                    performedBy: 'system',
                    performedByRole: 'system',
                    description: `${expiring.length} agreements expiring within 7 days – notifications sent`,
                    metadata: { count: expiring.length },
                });
            }
        } catch (error) {
            console.error('[CRON] Error checking agreements:', error);
        }
    });

    console.log('[CRON] ✅ All scheduled tasks initialized:');
    console.log('  • Daily rent reminders (10:00 AM)');
    console.log('  • Monthly billing generation (1st, 12:01 AM)');
    console.log('  • Agreement expiry check (9:00 AM)');
};
