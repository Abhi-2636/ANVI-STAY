const axios = require('axios');

// Placeholder for an actual WhatsApp API (e.g., Twilio, Meta Graph, UltraMsg, WATI)
// Since we do not have actual credentials, we simulate the sending process by logging it.

exports.sendWhatsAppReminder = async (phone, name, amount, monthStr, roomInfo) => {
    try {
        const text = `Hello ${name || 'Tenant'},\n\nThis is a gentle reminder from ANVI STAY regarding your pending dues for Room ${roomInfo} for ${monthStr}.\n\nTotal Pending Amount: ₹${amount.toLocaleString('en-IN')}\n\nPlease clear the dues at your earliest convenience. Let us know if you have already paid.\n\nThank you!`;

        // Simulate API Call
        console.log(`[WhatsApp API MOCK] Sending REMINDER to ${phone}:`);
        console.log(`--------------------------------------------------`);
        console.log(text);
        console.log(`--------------------------------------------------`);

        return { success: true, message: 'Reminder sent simulating WhatsApp API' };
    } catch (error) {
        console.error('[WhatsApp API] Failed to send reminder:', error.message);
        return { success: false, error: error.message };
    }
};

exports.sendWhatsAppReceipt = async (phone, name, amount, monthStr, roomInfo) => {
    try {
        const text = `Hello ${name || 'Tenant'},\n\nThank you! We have received your payment of ₹${amount.toLocaleString('en-IN')} for Room ${roomInfo} for ${monthStr}.\n\nRegards,\nANVI STAY`;

        // Simulate API Call
        console.log(`[WhatsApp API MOCK] Sending RECEIPT to ${phone}:`);
        console.log(`--------------------------------------------------`);
        console.log(text);
        console.log(`--------------------------------------------------`);

        return { success: true, message: 'Receipt sent simulating WhatsApp API' };
    } catch (error) {
        console.error('[WhatsApp API] Failed to send receipt:', error.message);
        return { success: false, error: error.message };
    }
};
