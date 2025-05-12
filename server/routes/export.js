const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ExportLog = require('../models/exportlog');
const Transaction = require('../models/transaction');
const authenticate = require('../middleware/authenticate');
const { generateCSV, generatePDF } = require('../utils/exportGenerator');

const FREE_LIMIT = 5;

// ✅ 1. Check export limit
router.post('/check', authenticate, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('🧠 [CHECK] User:', userId.toString(), '| Role:', req.user.role, '| Premium:', req.user.isPremium);

    if (req.user.role === 'admin' || req.user.isPremium) {
      return res.json({ allowed: true });
    }

    const count = await ExportLog.countDocuments({ userId });
    console.log('📊 [CHECK] Export count:', count);

    if (count >= FREE_LIMIT) {
      console.log('🚫 [CHECK] Export limit reached');
      return res.status(403).json({ allowed: false });
    }

    return res.json({ allowed: true });
  } catch (err) {
    console.error('❌ [CHECK] Export check failed:', err);
    return res.status(500).json({ allowed: false });
  }
});

// ✅ 2. Export CSV
router.post('/csv', authenticate, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('📝 [CSV EXPORT] User:', userId.toString());

    if (req.user.role !== 'admin' && !req.user.isPremium) {
      const count = await ExportLog.countDocuments({ userId });
      console.log('📊 [CSV] Export count:', count);
      if (count >= FREE_LIMIT) {
        console.log('🚫 [CSV] Limit reached');
        return res.status(403).json({ message: 'CSV export limit reached' });
      }
    }

    const transactions = await Transaction.find({ userId });
    console.log('✅ [CSV] Transactions:', transactions.length);

    const csvBuffer = generateCSV(transactions);
    await ExportLog.create({ userId, type: 'csv' });
    console.log('📁 [CSV] Export log saved');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"transactions.csv\"');
    res.send(csvBuffer);
  } catch (err) {
    console.error('❌ [CSV] Export error:', err);
    res.status(500).json({ message: 'Failed to export CSV' });
  }
});

// ✅ 3. Export PDF
router.post('/pdf', authenticate, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('📥 [PDF] Export requested by user:', userId.toString());

    if (req.user.role !== 'admin' && !req.user.isPremium) {
      const count = await ExportLog.countDocuments({ userId });
      console.log('📊 [PDF] Export count:', count);

      if (count >= FREE_LIMIT) {
        console.log('🚫 [PDF] Limit reached');
        return res.status(403).json({ message: 'PDF export limit reached' });
      }
    }

    const transactions = await Transaction.find({ userId });
    console.log('✅ [PDF] Transactions fetched:', transactions.length);

    const pdfBuffer = generatePDF(transactions);

    if (!pdfBuffer || pdfBuffer.length < 100) {
      console.error('❌ [PDF] Invalid or empty PDF buffer');
      return res.status(500).json({ message: 'PDF generation failed' });
    }

    await ExportLog.create({ userId, type: 'pdf' });
    console.log('✅ [PDF] Export log saved');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=\"transactions.pdf\"');
    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error('❌ [PDF] Export route failed:', err);
    res.status(500).json({ message: 'Failed to export PDF' });
  }
});

// ✅ 4. Log per-category exports
router.post('/log', authenticate, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { type } = req.body;

    console.log('📦 [LOG] Type:', type, '| User:', userId.toString());

    if (!['csv', 'pdf'].includes(type)) {
      console.log('❌ [LOG] Invalid export type');
      return res.status(400).json({ message: 'Invalid export type' });
    }

    if (req.user.role !== 'admin' && !req.user.isPremium) {
      const count = await ExportLog.countDocuments({ userId });
      console.log('📊 [LOG] Export count:', count);
      if (count >= FREE_LIMIT) {
        console.log('🚫 [LOG] Export limit reached');
        return res.status(403).json({ message: 'Export limit reached' });
      }
    }

    await ExportLog.create({ userId, type });
    console.log('✅ [LOG] Export recorded');
    res.status(201).json({ message: 'Export logged' });
  } catch (err) {
    console.error('❌ [LOG] Failed:', err);
    res.status(500).json({ message: 'Failed to log export' });
  }
});

module.exports = router;
