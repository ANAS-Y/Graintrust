const express = require('express');
const { fundEscrow, disburseFunds, getMyEscrows, verifyQuality } = require('../controller/escrowController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// @desc    Verify Quality using AI Scan
// @route   POST /api/escrow/verify/:grainId
router.post('/verify/:grainId', protect, authorize('mill'), verifyQuality);

// @desc    Fund Escrow for a Grain Listing (Simulated Interswitch)
// @route   POST /api/escrow/fund/:grainId
router.post('/fund/:grainId', protect, authorize('mill'), fundEscrow);

// @desc    Verify Quality and Trigger Disbursement (Simulated Interswitch)
// @route   POST /api/escrow/disburse/:grainId
router.post('/disburse/:grainId', protect, authorize('mill'), disburseFunds);

// @desc    Get Mill's Active Escrows
// @route   GET /api/escrow/my-escrows
router.get('/my-escrows', protect, authorize('mill'), getMyEscrows);

module.exports = router;