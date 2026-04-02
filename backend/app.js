// backend/app.js
// Main Express app — wires ALL routes from both sessions
// npm install express mongoose cors helmet express-rate-limit dotenv

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

// ── Existing routes (session 1) ───────────────────────────────────────────────
const cartRouter     = require('./routes/cart');
const orderRouter    = require('./routes/orders');
const paymentRouter  = require('./routes/payments');
const reviewRouter   = require('./routes/reviews');

// ── New routes (session 2) ────────────────────────────────────────────────────
const farmerOnboardingRouter = require('./routes/farmer/onboarding');
const demandAlertRouter      = require('./routes/demandAlerts');
const subscriptionRouter     = require('./routes/subscriptions');
const deliveryTrackingRouter = require('./routes/deliveryTracking');
const bulkOrderRouter        = require('./routes/bulkOrders');
const adminRouter            = require('./routes/admin/index');

const app = express();

// ── Security & middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));

// Raw body for Razorpay webhook (must be before json parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts' });
app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Mount all routes ──────────────────────────────────────────────────────────
// Existing
app.use('/api/cart',              cartRouter);
app.use('/api/orders',            orderRouter);
app.use('/api/payments',          paymentRouter);
app.use('/api/products',          reviewRouter);    // nested: /api/products/:productId/reviews

// New — Farmer App
app.use('/api/farmer/onboarding', farmerOnboardingRouter);

// New — Buyer App
app.use('/api/demand-alerts',     demandAlertRouter);
app.use('/api/subscriptions',     subscriptionRouter);
app.use('/api/delivery',          deliveryTrackingRouter);
app.use('/api/bulk-orders',       bulkOrderRouter);

// New — Admin
app.use('/api/admin',             adminRouter);

// ── Error handler (must be LAST) ──────────────────────────────────────────────
app.use(errorHandler);

// ── DB connection + server start ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => { console.error('DB connection failed:', err); process.exit(1); });

module.exports = app; // for tests