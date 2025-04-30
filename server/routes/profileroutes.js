// server/routes/profileroutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const authenticate = require('../middleware/authenticate');
const User = require('../models/user');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
  }
});
const upload = multer({ storage });

// GET profile
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('fullName businessName avatarUrl email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST update profile
router.post('/', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    console.log('--- PROFILE UPDATE REQUEST ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.fullName = req.body.fullName || user.fullName;
    user.businessName = req.body.businessName || user.businessName;
    if (req.file) {
      user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    console.log('Saving user with:', {
      fullName: user.fullName,
      businessName: user.businessName,
      avatarUrl: user.avatarUrl
    });

    await user.save();

    return res.json({
      fullName: user.fullName,
      businessName: user.businessName,
      avatarUrl: user.avatarUrl,
      email: user.email
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Could not update profile' });
  }
});

module.exports = router;
