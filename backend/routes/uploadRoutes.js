/**
 * File Upload Routes
 */
const express = require('express');
const router = express.Router();
const { uploadMiddleware, uploadFile, uploadMultiple, deleteFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Single file upload
router.post('/:category', protect, uploadMiddleware.single('file'), uploadFile);

// Multiple files upload (max 5)
router.post('/:category/multiple', protect, uploadMiddleware.array('files', 5), uploadMultiple);

// Delete a file
router.delete('/:category/:filename', protect, deleteFile);

module.exports = router;
