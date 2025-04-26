// server/controllers/reportcontroller.js
const mongoose    = require('mongoose');
const Transaction = require('../models/transaction');

exports.getReport = async (req, res) => {
  try {
    // Use `new` when creating an ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1) Totals by type
    const totals = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    // 2) Breakdown by category
    const byCategory = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $ifNull: ['$category', 'Uncategorized'] },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // 3) Summary numbers
    const totalIncome   = totals.find(t => t._id === 'income')?.total   || 0;
    const totalExpenses = totals.find(t => t._id === 'expense')?.total  || 0;
    const balance       = totalIncome - totalExpenses;

    return res.json({
      totalIncome,
      totalExpenses,
      balance,
      totals,
      byCategory
    });
  } catch (err) {
    console.error('Report error:', err);
    return res.status(500).json({ message: 'Failed to fetch report', error: err.message });
  }
};
