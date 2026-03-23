const express = require('express');
const { getGrains, getMyListings, createListing, updateListing, deleteListing, scanField, generateGrainVisualization } = require('../controller/grainController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// @desc    Scan field image for yield prediction
// @route   POST /api/grains/scan-field
router.post('/scan-field', protect, authorize('farmer'), scanField);

// @desc    Generate AI visualization for grain
// @route   POST /api/grains/visualize
router.post('/visualize', protect, generateGrainVisualization);

// @desc    Get all grains
// @route   GET /api/grains
router.get('/', getGrains);

// @desc    Get farmer's own grains
// @route   GET /api/grains/my-listings
router.get('/my-listings', protect, authorize('farmer'), getMyListings);

// @desc    Create a grain listing
// @route   POST /api/grains
router.post('/', protect, authorize('farmer'), createListing);

// @desc    Update a grain listing
// @route   PUT /api/grains/:id
router.put('/:id', protect, authorize('farmer'), updateListing);

// @desc    Delete a grain listing
// @route   DELETE /api/grains/:id
router.delete('/:id', protect, authorize('farmer'), deleteListing);

module.exports = router;
