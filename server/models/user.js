const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  fullName:     { type: String, default: '' },
  businessName: { type: String, default: '' },
  avatarUrl:    { type: String, default: '' },

  // 🚀 New Fields for Premium System
  isPremium: { type: Boolean, default: false },               // Premium status
  role: { type: String, enum: ['user', 'admin'], default: 'user' } // User or admin
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
