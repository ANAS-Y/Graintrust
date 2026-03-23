const mongoose = require('mongoose');

const grainSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, default: 'Faro 44 (Paddy)' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  status: { 
    type: String, 
    enum: ['available', 'escrow_funded', 'verified', 'completed', 'disputed'], 
    default: 'available' 
  },
  yieldPrediction: {
    tonnage: Number,
    confidence: Number,
    harvestDate: Date
  },
  qualityMetrics: {
    moisture: Number,
    impurities: Number,
    grade: String,
    summary: String
  },
  escrowId: { type: String }, // Simulated Interswitch Escrow ID
  createdAt: { type: Date, default: Date.now },
});

const Grain = mongoose.model('Grain', grainSchema);
module.exports = Grain;
