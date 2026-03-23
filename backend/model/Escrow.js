const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  grain: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Grain', 
    required: true 
  },
  mill: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  interswitchRef: { 
    type: String, 
    unique: true,
    required: true 
  },
  status: { 
    type: String, 
    enum: ['funded', 'verified', 'disbursed', 'disputed', 'refunded'], 
    default: 'funded' 
  },
  qualityScanResult: {
    moisture: Number,
    grade: String,
    scannedAt: Date
  },
  disbursementDate: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Escrow = mongoose.model('Escrow', escrowSchema);

module.exports = Escrow;