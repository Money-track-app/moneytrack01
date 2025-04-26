const mongoose    = require('mongoose');
const Transaction = require('../models/transaction');

exports.getTransactions = async (req, res) => {
  try {
    // make sure userId is an ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // fetch all this user’s transactions, sorted newest first
    const txns = await Transaction.find({ userId }).sort({ date: -1 });
    return res.json(txns);
  } catch (err) {
    console.error('GetTxns error:', err);
    return res.status(500).json({ message: 'Failed to load transactions', error: err.message });
  }
};
