const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getVisitors, addVisitor, checkoutVisitor, deleteVisitor } = require('../controllers/visitorController');

router.get('/', protect, authorize('admin'), getVisitors);
router.post('/', protect, authorize('admin'), addVisitor);
router.put('/:id/checkout', protect, authorize('admin'), checkoutVisitor);
router.delete('/:id', protect, authorize('admin'), deleteVisitor);

module.exports = router;
