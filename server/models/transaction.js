const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String },
  amount: { type: Number },
  date: { type: Date },
  description: { type: String },
  receipt: {
    data: Buffer,           // raw file bytes
    contentType: String     // MIME type, e.g. 'image/png' or 'application/pdf'
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);

