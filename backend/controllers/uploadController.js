/**
 * File Upload Controller – Handle file uploads (photos, documents, screenshots)
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logAction } = require('./auditController');

// ── Ensure upload directories exist ──
const uploadDirs = ['uploads/photos', 'uploads/documents', 'uploads/screenshots', 'uploads/misc'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// ── Multer storage configuration ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.params.category || 'misc';
        const validCategories = ['photos', 'documents', 'screenshots', 'misc'];
        const dir = validCategories.includes(category) ? category : 'misc';
        cb(null, path.join(__dirname, '..', 'uploads', dir));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// ── File filter ──
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC) are allowed'), false);
    }
};

// ── Multer instance ──
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Export multer middleware for routes
exports.uploadMiddleware = upload;

// ──────────────────────────────────────
// @route   POST /api/uploads/:category
// @desc    Upload a single file
// @access  Private
// ──────────────────────────────────────
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.params.category || 'misc'}/${req.file.filename}`;

        // Log the upload
        await logAction({
            action: 'file_uploaded',
            performedBy: req.admin?.name || 'tenant',
            performedByRole: req.admin ? req.admin.role : 'tenant',
            targetType: 'file',
            targetId: req.file.filename,
            description: `Uploaded ${req.file.originalname} to ${req.params.category}`,
            metadata: {
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });

        res.status(201).json({
            success: true,
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    } catch (err) {
        console.error('[uploadController] uploadFile error:', err);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};

// ──────────────────────────────────────
// @route   POST /api/uploads/:category/multiple
// @desc    Upload multiple files (max 5)
// @access  Private
// ──────────────────────────────────────
exports.uploadMultiple = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            url: `/uploads/${req.params.category || 'misc'}/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
        }));

        await logAction({
            action: 'file_uploaded',
            performedBy: req.admin?.name || 'tenant',
            performedByRole: req.admin ? req.admin.role : 'tenant',
            targetType: 'file',
            description: `Uploaded ${files.length} files to ${req.params.category}`,
        });

        res.status(201).json({ success: true, count: files.length, data: files });
    } catch (err) {
        console.error('[uploadController] uploadMultiple error:', err);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};

// ──────────────────────────────────────
// @route   DELETE /api/uploads/:category/:filename
// @desc    Delete an uploaded file
// @access  Private (admin)
// ──────────────────────────────────────
exports.deleteFile = async (req, res) => {
    try {
        const { category, filename } = req.params;
        const filePath = path.join(__dirname, '..', 'uploads', category, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        fs.unlinkSync(filePath);

        await logAction({
            action: 'file_uploaded',
            performedBy: req.admin?.name || 'system',
            performedByRole: req.admin ? req.admin.role : 'system',
            targetType: 'file',
            targetId: filename,
            description: `Deleted file ${filename} from ${category}`,
        });

        res.status(200).json({ success: true, message: 'File deleted' });
    } catch (err) {
        console.error('[uploadController] deleteFile error:', err);
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
};
