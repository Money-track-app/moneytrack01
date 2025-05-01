const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  type:      { type: String, enum: ['income', 'expense'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
