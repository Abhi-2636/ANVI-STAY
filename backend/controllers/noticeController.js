const Notice = require('../models/Notice');

// GET /api/notices — public (tenants see active notices)
exports.getActiveNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ active: true }).sort('-createdAt');
    res.status(200).json({ success: true, data: notices });
  } catch (err) {
    console.error('[noticeController] getActiveNotices error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/notices/all — admin only (all notices)
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort('-createdAt');
    res.status(200).json({ success: true, data: notices });
  } catch (err) {
    console.error('[noticeController] getAllNotices error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/notices — admin creates notice
exports.createNotice = async (req, res) => {
  try {
    const { text, priority } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Notice text is required' });
    const notice = await Notice.create({ text, priority });
    res.status(201).json({ success: true, data: notice });
  } catch (err) {
    console.error('[noticeController] createNotice error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/notices/:id — admin updates notice
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.status(200).json({ success: true, data: notice });
  } catch (err) {
    console.error('[noticeController] updateNotice error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/notices/:id — admin deletes notice
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    console.error('[noticeController] deleteNotice error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
