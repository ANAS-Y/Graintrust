const Grain = require('../model/Grain.js');
const { analyzeFieldImage, generateImage } = require('../services/aiService.js');

// @desc    Analyze field image for yield prediction
// @route   POST /api/grains/scan-field
const scanField = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Request body is missing' });
    const { image } = req.body; // base64 image
    if (!image) return res.status(400).json({ error: 'Image is required' });

    const analysis = await analyzeFieldImage(image);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Generate a visualization for a grain type
// @route   POST /api/grains/visualize
const generateGrainVisualization = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Request body is missing' });
    const { type, fieldImage } = req.body;
    if (!type) return res.status(400).json({ error: 'Grain type is required' });

    const prompt = `A high-quality, professional photograph of a large quantity of premium ${type} grains in a clean, modern agricultural warehouse setting. Soft natural lighting, macro focus.`;
    
    // Pass the fieldImage if the farmer provided one
    const imageUrl = await generateImage(prompt, type, fieldImage);
    
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all grains
// @route   GET /api/grains
const getGrains = async (req, res) => {
  try {
    const grains = await Grain.find({ status: 'available' }).populate('farmer', 'name email');
    res.json(grains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get farmer's own grains
// @route   GET /api/grains/my-listings
const getMyListings = async (req, res) => {
  try {
    const grains = await Grain.find({ farmer: req.user._id });
    res.json(grains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Create a grain listing
// @route   POST /api/grains
const createListing = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Request body is missing' });
    const { type, quantity, price, location, description, imageUrl, yieldPrediction } = req.body;
    const grain = new Grain({
      farmer: req.user._id,
      type,
      quantity,
      price,
      location,
      description,
      imageUrl,
      yieldPrediction,
    });
    await grain.save();
    res.status(201).json(grain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update a grain listing
// @route   PUT /api/grains/:id
const updateListing = async (req, res) => {
  try {
    let grain = await Grain.findById(req.params.id);
    if (!grain) return res.status(404).json({ error: 'Listing not found' });
    if (grain.farmer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized to update this listing' });
    }
    grain = await Grain.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(grain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete a grain listing
// @route   DELETE /api/grains/:id
const deleteListing = async (req, res) => {
  try {
    const grain = await Grain.findById(req.params.id);
    if (!grain) return res.status(404).json({ error: 'Listing not found' });
    if (grain.farmer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized to delete this listing' });
    }
    await grain.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  scanField,
  generateGrainVisualization,
  getGrains,
  getMyListings,
  createListing,
  updateListing,
  deleteListing
};