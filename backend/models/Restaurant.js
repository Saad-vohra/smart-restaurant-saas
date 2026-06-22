const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  gstRate: { type: Number, default: 5 },
  currency: { type: String, default: 'INR' },
  plan: { type: String, enum: ['trial', 'basic', 'pro', 'enterprise'], default: 'trial' },
  active: { type: Boolean, default: true },
  trialEndsAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
