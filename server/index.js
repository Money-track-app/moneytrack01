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

// Models & Passport config
const User = require('./models/user');
require('./passport'); // 🔐 Google OAuth strategy

// ✅ Global Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'sessionSecret123',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/moneytrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully', user: { id: newUser._id, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, SECRET, { expiresIn: '1d' });
    res.redirect(`http://localhost:5173/dashboard?token=${encodeURIComponent(token)}`);
  }
);

// ✅ JWT Authentication middleware
const authenticate = require('./middleware/authenticate');

// ✅ Mount API routes
const reportRoutes = require('./routes/reportroutes');
app.use('/api/reports', reportRoutes);

const transactionRoutes = require('./routes/transactionroutes');
app.use('/api/transactions', transactionRoutes);

const receiptsRoutes = require('./routes/receiptsroutes');
app.use('/api/receipts', receiptsRoutes);

// ✅ Root route
app.get('/', (req, res) => res.send('✅ Backend is running!'));

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));


