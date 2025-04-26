const express      = require('express');
const router       = express.Router();
const authenticate = require('../middleware/authenticate');
const { getTransactions } = require('../controllers/transactioncontroller');

// GET /api/transactions
router.get('/', authenticate, getTransactions);

module.exports = router;
