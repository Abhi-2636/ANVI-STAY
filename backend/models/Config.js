const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // Branding
        logoUrl: { type: String, default: '' },
        brandName: { type: String, default: 'ANVI STAY' },
        tagline: { type: String, default: 'We Listen, We Care, You Stay' },
        primaryColor: { type: String, default: '#C8A24A' },
        // UPI Payment config
        upiVpa: { type: String, default: '' },
        upiPayeeName: { type: String, default: '' },
        // General config data (flexible JSON)
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Config', configSchema);
