const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
const PORT = 5000;
const SECRET = process.env.JWT_SECRET || 'secretkey';

const User = require('./models/user');
require('./passport'); // 🔐 Import Google OAuth strategy

// ✅ Middleware
app.use(cors({ origin: 'http://localhost:5174', credentials: true }));
app.use(express.json());


// 🔐 Session + Passport (required for Google OAuth)
app.use(session({
  secret: 'sessionSecret123',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/moneytrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Register Route
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong during registration', error: err.message });
  }
});

// ✅ Login Route
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong during login', error: err.message });
  }
});

// ✅ Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, SECRET, { expiresIn: '1d' });

    // ✅ Redirect to React dashboard page with token in URL
    res.redirect(`http://localhost:5173/dashboard?token=${encodeURIComponent(token)}`);

  }
);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
