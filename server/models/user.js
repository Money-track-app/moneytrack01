// server/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  fullName:     { type: String, default: '' },       // user’s name
  businessName: { type: String, default: '' },       // user’s business name
  avatarUrl:    { type: String, default: '' },       // URL to uploaded avatar (optional)
}, {
  timestamps: true                                  // adds createdAt & updatedAt
});

module.exports = mongoose.model('User', userSchema);