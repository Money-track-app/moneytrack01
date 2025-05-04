require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const session   = require('express-session');
const passport  = require('passport');
const cron      = require('node-cron');
const dayjs     = require('dayjs');

// Models & Passport config
const User                 = require('./models/user');
const Transaction          = require('./models/transaction');
const ScheduledTransaction = require('./models/scheduledtransaction');
require('./passport'); // Google OAuth strategy

// JWT Authentication middleware
const authenticate         = require('./middleware/authenticate');

// Express app setup
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'secretkey';

// Global Middleware
// old
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'sessionSecret123',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashed });
    res.status(201).json({ message: 'User registered', user: { id: newUser._id, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, SECRET, { expiresIn: '1d' });
    res.redirect(`http://localhost:5173/dashboard?token=${encodeURIComponent(token)}`);
  }
);

const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Load routes modules
const reportRoutes      = require('./routes/reportroutes');
const transactionRoutes = require('./routes/transactionroutes');
const receiptsRoutes    = require('./routes/receiptsroutes');
const profileRoutes = require('./routes/profileroutes')
const categoryRoutes = require('./routes/categoriesroutes');




// Scheduled routes (support CJS and ES default)
let scheduledRoutes = require('./routes/scheduledroutes');
if (scheduledRoutes && typeof scheduledRoutes.default === 'function') {
  scheduledRoutes = scheduledRoutes.default;
}

// Mount API routes
app.use('/api/reports', reportRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/scheduled', authenticate, scheduledRoutes);
app.use('/api/profile', authenticate, profileRoutes);
app.use('/api/categories', categoryRoutes);


// Root route
app.get('/', (req, res) => res.send('Backend is running!'));

// Connect DB and start cron + server
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moneytrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');

  // Daily cron job
  cron.schedule('0 0 * * *', async () => {
    const now = dayjs();
    const due = await ScheduledTransaction.find({ nextRun: { $lte: now.toDate() } });
    for (const rule of due) {
      await Transaction.create({
        userId: rule.userId,
        type: rule.type,
        category: rule.category,
        amount: rule.amount,
        date: rule.nextRun,
        description: rule.title
      });
      let next = dayjs(rule.nextRun);
      if (rule.frequency === 'monthly') next = next.add(1, 'month').date(rule.dayOfMonth);
      else next = next.add(1, 'year').month(rule.month - 1).date(rule.dayOfMonth);
      rule.nextRun = next.toDate();
      await rule.save();
    }
  });

  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
})
.catch(err => console.error('DB connection error:', err));




