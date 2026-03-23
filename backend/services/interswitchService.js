const axios = require('axios');
const crypto = require('crypto');

/**
 * Interswitch Integration Service
 * 
 * Requirements in .env:
 * INTERSWITCH_CLIENT_ID=your_client_id
 * INTERSWITCH_CLIENT_SECRET=your_client_secret
 * INTERSWITCH_TERMINAL_ID=your_terminal_id
 * INTERSWITCH_MERCHANT_CODE=your_merchant_code
 */

const INTERSWITCH_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://saturn.interswitchng.com/api/v2' 
  : 'https://qa.interswitchng.com/api/v2';

/**
 * Generates the Interswitch Auth v2 Signature
 * @param {string} method - HTTP Method (GET, POST, etc)
 * @param {string} url - Full request URL
 * @param {string} timestamp - Current timestamp
 * @param {string} nonce - Unique random string
 */
const generateSignature = (method, url, timestamp, nonce) => {
  const clientId = process.env.INTERSWITCH_CLIENT_ID;
  const clientSecret = process.env.INTERSWITCH_CLIENT_SECRET;
  
  // Signature components must be joined in this specific order
  const signatureString = `${method}&${encodeURIComponent(url)}&${timestamp}&${nonce}&${clientId}&${clientSecret}`;
  
  return crypto
    .createHash('sha512')
    .update(signatureString)
    .digest('base64');
};

/**
 * Get headers required for Interswitch API calls
 */
const getHeaders = (method, url) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = generateSignature(method, url, timestamp, nonce);

  return {
    'Authorization': `InterswitchAuth ${Buffer.from(process.env.INTERSWITCH_CLIENT_ID).toString('base64')}`,
    'Timestamp': timestamp,
    'Nonce': nonce,
    'Signature': signature,
    'SignatureMethod': 'SHA512',
    'TerminalID': process.env.INTERSWITCH_TERMINAL_ID,
    'Content-Type': 'application/json'
  };
};

/**
 * Initiate an Escrow Payment (Funding)
 * This would typically return a payment URL or a transaction reference
 */
const initiateEscrowFunding = async (amount, email, reference) => {
  const url = `${INTERSWITCH_BASE_URL}/payments/initiate`;
  const data = {
    amount: (amount * 100).toString(), // Interswitch expects amount in Kobo
    email,
    transactionReference: reference,
    merchantCode: process.env.INTERSWITCH_MERCHANT_CODE,
    terminalId: process.env.INTERSWITCH_TERMINAL_ID,
    currency: 'NGN',
    callbackUrl: `${process.env.APP_URL}/api/escrow/callback`
  };

  try {
    const response = await axios.post(url, data, {
      headers: getHeaders('POST', url)
    });
    return response.data;
  } catch (error) {
    console.error('Interswitch Funding Error:', error.response?.data || error.message);
    throw new Error('Failed to initiate Interswitch payment');
  }
};

/**
 * Disburse funds to Farmer (Transfer API)
 */
const disburseToFarmer = async (amount, bankCode, accountNumber, reference) => {
  const url = `${INTERSWITCH_BASE_URL}/transfers`;
  const data = {
    amount: (amount * 100).toString(),
    termination: {
      accountNumber,
      bankCode
    },
    transferReference: reference,
    currency: 'NGN',
    narration: 'GrainTrust AI Produce Payment'
  };

  try {
    const response = await axios.post(url, data, {
      headers: getHeaders('POST', url)
    });
    return response.data;
  } catch (error) {
    console.error('Interswitch Disbursement Error:', error.response?.data || error.message);
    throw new Error('Failed to disburse funds via Interswitch');
  }
};

/**
 * Verify Transaction Status
 */
const verifyTransaction = async (reference) => {
  const url = `${INTERSWITCH_BASE_URL}/transactions?transactionReference=${reference}`;
  
  try {
    const response = await axios.get(url, {
      headers: getHeaders('GET', url)
    });
    return response.data;
  } catch (error) {
    console.error('Interswitch Verification Error:', error.response?.data || error.message);
    throw new Error('Failed to verify Interswitch transaction');
  }
};

module.exports = {
  initiateEscrowFunding,
  disburseToFarmer,
  verifyTransaction
};
