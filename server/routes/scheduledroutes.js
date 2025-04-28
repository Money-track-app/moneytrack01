// routes/scheduledroutes.js
const express = require('express');
const router  = express.Router();
const dayjs   = require('dayjs');

// ——— Directly require your model — no mongoose.models indirection ———
const Scheduled = require('../models/scheduledtransaction');


// … the rest of your file stays the same …
function calcNextRun({ frequency, dayOfMonth, month }) { /* … */ }

// after
router.post('/', async (req, res) => {
  try {
    const {
      title, type, amount, category,
      frequency, dayOfMonth, month
    } = req.body;

    const nextRun = calcNextRun({ frequency, dayOfMonth, month });

    // build a Mongoose document instance…
    const schedDoc = new Scheduled({
      userId:     req.user.id,
      title,
      type,
      amount,
      category,
      frequency,
      dayOfMonth,
      month,
      nextRun
    });

    // …and then save it
    await schedDoc.save();

    return res.status(201).json(schedDoc);
  } catch (err) {
    console.error('Error creating scheduled rule:', err);
    return res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => { /* … */ });

module.exports = router;



