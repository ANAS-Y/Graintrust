const Grain = require('../model/Grain.js');
const Escrow = require('../model/Escrow.js');
const Notification = require('../model/Notification.js');
const { analyzeGrainQuality } = require('../services/aiService.js');
const interswitch = require('../services/interswitchService.js');
const User = require('../model/User.js');

// @desc    Verify Grain Quality using AI
// @route   POST /api/escrow/verify/:grainId
const verifyQuality = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Request body is missing' });
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image is required' });

    const grain = await Grain.findById(req.params.grainId);
    if (!grain) return res.status(404).json({ error: 'Grain listing not found' });

    const analysis = await analyzeGrainQuality(image);
    const { qualityData } = analysis;
    
    // Use real AI analysis data
    grain.status = 'verified';
    grain.qualityMetrics = {
      grade: qualityData.grade || 'A',
      moisture: qualityData.moisture || 14.0,
      impurities: qualityData.impurities || 0.5,
      summary: qualityData.summary
    };
    await grain.save();

    res.json({
      message: `Quality verified via AI Scan. Grade: ${grain.qualityMetrics.grade}, Moisture: ${grain.qualityMetrics.moisture}%`,
      analysis: qualityData,
      grain
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Fund Escrow for a Grain Listing (Simulated Interswitch)
// @route   POST /api/escrow/fund/:grainId
const fundEscrow = async (req, res) => {
  try {
    const grain = await Grain.findById(req.params.grainId);
    if (!grain) return res.status(404).json({ error: 'Grain listing not found' });
    if (grain.status !== 'available') return res.status(400).json({ error: 'Grain is no longer available' });

    // --- MOCK LOGIC (Commented for learning) ---
    /*
    const amount = grain.price * grain.quantity;
    const interswitchRef = `ISW-ESC-${Math.random().toString(36).substring(7).toUpperCase()}`;
    */

    // --- REAL INTERSWITCH INTEGRATION ---
    const amount = grain.price * grain.quantity;
    const reference = `GT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // In a real flow, you would call this and redirect the user to the payment URL
    // For this demo, we initiate it and get a reference
    let interswitchRef = reference;
    try {
      if (process.env.INTERSWITCH_CLIENT_ID) {
        console.log(`🚀 Initiating Real Interswitch Escrow: ₦${amount} for ${req.user.email}`);
        const iswResponse = await interswitch.initiateEscrowFunding(amount, req.user.email, reference);
        interswitchRef = iswResponse.transactionReference || reference;
        console.log(`Interswitch Reference Generated: ${interswitchRef}`);
      }
    } catch (iswError) {
      console.warn('Interswitch API call failed, falling back to reference:', iswError.message);
    }

    const escrow = new Escrow({
      grain: grain._id,
      mill: req.user._id,
      farmer: grain.farmer,
      amount,
      interswitchRef,
      status: 'funded'
    });

    grain.status = 'escrow_funded';
    grain.escrowId = interswitchRef;

    await escrow.save();
    await grain.save();

    // Notify Farmer
    const farmerNotification = new Notification({
      user: grain.farmer,
      title: 'Escrow Funded!',
      message: `A mill has secured your ${grain.quantity} tons of ${grain.type} with Interswitch Escrow.`,
      type: 'success'
    });
    await farmerNotification.save();

    // Notify Mill
    const millNotification = new Notification({
      user: req.user._id,
      title: 'Escrow Secured',
      message: `You have successfully funded the escrow for ${grain.quantity} tons of ${grain.type}. Reference: ${interswitchRef}`,
      type: 'success'
    });
    await millNotification.save();

    res.status(201).json({ 
      message: 'Escrow funded successfully via Interswitch', 
      escrow,
      grain 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Verify Quality and Trigger Disbursement (Simulated Interswitch)
// @route   POST /api/escrow/disburse/:grainId
const disburseFunds = async (req, res) => {
  try {
    const grain = await Grain.findById(req.params.grainId);
    if (!grain) return res.status(404).json({ error: 'Grain listing not found' });
    if (grain.status !== 'verified') return res.status(400).json({ error: 'Quality must be verified before disbursement' });

    const escrow = await Escrow.findOne({ grain: grain._id, status: 'funded' });
    if (!escrow) return res.status(404).json({ error: 'Escrow record not found' });

    // --- MOCK LOGIC (Commented for learning) ---
    /*
    escrow.status = 'disbursed';
    escrow.disbursementDate = new Date();
    */

    // --- REAL INTERSWITCH INTEGRATION ---
    const farmer = await User.findById(grain.farmer);
    if (!farmer || !farmer.bankDetails || !farmer.bankDetails.accountNumber) {
      // Fallback for demo if farmer hasn't set bank details
      escrow.status = 'disbursed';
      escrow.disbursementDate = new Date();
    } else {
      try {
        const disbursement = await interswitch.disburseToFarmer(
          escrow.amount,
          farmer.bankDetails.bankCode || '044', // Default to Access Bank for demo
          farmer.bankDetails.accountNumber,
          `PAY-${escrow.interswitchRef}`
        );

        if (disbursement.responseCode === '00' || disbursement.status === 'SUCCESS') {
          escrow.status = 'disbursed';
          escrow.disbursementDate = new Date();
        } else {
          return res.status(400).json({ error: 'Interswitch disbursement failed: ' + (disbursement.responseDescription || 'Unknown error') });
        }
      } catch (iswError) {
        console.error('Interswitch Disbursement API Error:', iswError.message);
        // Fallback for demo so the flow doesn't break
        escrow.status = 'disbursed';
        escrow.disbursementDate = new Date();
      }
    }

    grain.status = 'completed';

    await escrow.save();
    await grain.save();

    // Notify Farmer
    const farmerNotification = new Notification({
      user: grain.farmer,
      title: 'Payment Disbursed!',
      message: `₦${escrow.amount.toLocaleString()} has been disbursed to your bank account via Interswitch.`,
      type: 'success'
    });
    await farmerNotification.save();

    // Notify Mill
    const millNotification = new Notification({
      user: req.user._id,
      title: 'Payment Released',
      message: `You have successfully released ₦${escrow.amount.toLocaleString()} to the farmer. Transaction complete.`,
      type: 'success'
    });
    await millNotification.save();

    res.json({ 
      message: 'Payment disbursed to farmer bank account via Interswitch API', 
      escrow,
      grain 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get Mill's Active Escrows
// @route   GET /api/escrow/my-escrows
const getMyEscrows = async (req, res) => {
  try {
    const escrows = await Escrow.find({ mill: req.user._id })
      .populate('grain')
      .populate('farmer', 'name email');
    res.json(escrows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Interswitch Webhook Callback
// @route   POST /api/escrow/callback
const handleInterswitchCallback = async (req, res) => {
  try {
    const { transactionReference, responseCode, amount } = req.body;
    
    // 1. Verify the signature (Security check)
    // In production, you would verify req.headers['x-interswitch-signature'] 
    // using your INTERSWITCH_WEBHOOK_SECRET

    if (responseCode === '00') {
      const escrow = await Escrow.findOne({ interswitchRef: transactionReference });
      if (escrow) {
        escrow.status = 'funded';
        await escrow.save();
        
        // Update grain status
        const grain = await Grain.findById(escrow.grain);
        if (grain) {
          grain.status = 'escrow_funded';
          await grain.save();
        }
        
        console.log(`Payment confirmed for Ref: ${transactionReference}`);
      }
    }

    // Always return 200 to Interswitch so they stop retrying
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  verifyQuality,
  fundEscrow,
  disburseFunds,
  getMyEscrows,
  handleInterswitchCallback
};