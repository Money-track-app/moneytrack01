// server/controllers/reportcontroller.js
const mongoose    = require('mongoose');
const Transaction = require('../models/transaction');

exports.getReport = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // build our match filter without any TS annotation
    const match = { userId };
    if (req.query.start) {
      const startDate = new Date(req.query.start);
      match.date = { ...match.date, $gte: startDate };
    }
    if (req.query.end) {
      const endDate = new Date(req.query.end);
      endDate.setHours(23, 59, 59, 999);
      match.date = { ...match.date, $lte: endDate };
    }

    const totals = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const byCategory = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$category', 'Uncategorized'] },
          total: { $sum: '$amount' }
        }
      }
    ]);

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

