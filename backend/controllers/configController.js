const Config = require('../models/Config');

// GET /api/config/:key — get config by key (public for branding)
exports.getConfig = async (req, res) => {
    try {
        const config = await Config.findOne({ key: req.params.key });
        if (!config) return res.status(404).json({ success: false, message: 'Config not found' });
        res.status(200).json({ success: true, data: config });
    } catch (err) {
        console.error('[configController] getConfig error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/config/:key — create or update config (admin only)
exports.upsertConfig = async (req, res) => {
    try {
        const config = await Config.findOneAndUpdate(
            { key: req.params.key },
            { ...req.body, key: req.params.key },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: config });
    } catch (err) {
        console.error('[configController] upsertConfig error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/config — list all configs (admin)
exports.getAllConfigs = async (req, res) => {
    try {
        const configs = await Config.find().sort('key');
        res.status(200).json({ success: true, data: configs });
    } catch (err) {
        console.error('[configController] getAllConfigs error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
