const express = require('express');
const router = express.Router();
const ExportLog = require('../models/exportlog');
const authenticate = require('../middleware/authenticate');

const FREE_LIMIT = 5;

router.post('/check', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Admins and premium users have no limit
    if (req.user.role === 'admin' || req.user.isPremium) {
      return res.json({ allowed: true });
    }

    // Count exports this user has made
    const count = await ExportLog.countDocuments({ userId });
    if (count >= FREE_LIMIT) {
      return res.status(403).json({ allowed: false });
    }

    // Log this export
    await ExportLog.create({ userId });
    return res.json({ allowed: true });

  } catch (err) {
    console.error('Export check failed:', err);
    return res.status(500).json({ allowed: false, error: err.message });
  }
});

module.exports = router;
