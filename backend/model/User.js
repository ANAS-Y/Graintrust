const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'mill'], default: 'farmer' },
  bankDetails: {
    accountNumber: { type: String },
    bankName: { type: String },
    bankCode: { type: String },
    bvn: { type: String },
  },
  preferences: {
    notificationLanguage: { type: String, default: 'English' },
    smsAlerts: { type: Boolean, default: false },
    payoutMethod: { type: String, default: 'Instant (Interswitch Disbursement)' }
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;