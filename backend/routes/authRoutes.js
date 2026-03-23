const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controller/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', registerUser);

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', loginUser);

// @desc    Get user profile
// @route   GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put('/profile', protect, updateUserProfile);

module.exports = router;
