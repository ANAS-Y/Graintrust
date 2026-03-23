const express = require('express');
const { getNotifications, markAsRead } = require('../controller/notificationController.js');
const { protect } = require('../middleware/authMiddleware.js');
const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
router.get('/', protect, getNotifications);

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
router.put('/:id/read', protect, markAsRead);

module.exports = router;
