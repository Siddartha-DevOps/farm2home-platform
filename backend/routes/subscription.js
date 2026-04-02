// subscriptions.js
// Recurring orders — daily milk, weekly vegetables for restaurants/hotels
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const Subscription = require('../models/Subscription');
const Product      = require('../models/Product');

// Helper: compute next delivery date based on frequency + delivery days
function computeNextDelivery(frequency, deliveryDays, startDate) {
  const now = startDate || new Date();
  if (frequency === 'daily') {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return next;
  }
  if (frequency === 'weekly' && deliveryDays?.length) {
    const today = now.getDay();
    const sorted = [...deliveryDays].sort();
    const nextDay = sorted.find((d) => d > today) ?? sorted[0];
    const daysAhead = nextDay > today ? nextDay - today : 7 - today + nextDay;
    const next = new Date(now);
    next.setDate(next.getDate() + daysAhead);
    return next;
  }
  if (frequency === 'biweekly') {
    const next = new Date(now);
    next.setDate(next.getDate() + 14);
    return next;
  }
  if (frequency === 'monthly') {
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1);
    return next;
  }
  return now;
}

// ── GET /api/subscriptions — list my subscriptions ───────────────────────────
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const subs = await Subscription.find({ buyer: req.user.id })
      .populate('items.product', 'name images price unit')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subs });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/subscriptions — create a subscription ──────────────────────────
router.post(
  '/',
  verifyToken,
  [
    body('name').notEmpty().withMessage('Subscription name is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.productId').notEmpty().withMessage('productId required'),
    body('items.*.quantityKg').isFloat({ min: 0.1 }).withMessage('Quantity > 0 required'),
    body('frequency').isIn(['daily','weekly','biweekly','monthly']).withMessage('Invalid frequency'),
    body('deliveryDays').optional().isArray(),
    body('deliverySlot').optional().isIn(['6am-9am','9am-12pm','12pm-3pm','3pm-6pm']),
    body('shippingAddress.street').notEmpty().withMessage('Street required'),
    body('shippingAddress.city').notEmpty().withMessage('City required'),
    body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('Invalid pincode'),
    body('startDate').isISO8601().withMessage('Start date required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, items, frequency, deliveryDays, deliverySlot, shippingAddress, startDate, endDate, paymentMethod } = req.body;

      // Fetch products and build items
      let totalPerCycle = 0;
      const resolvedItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        totalPerCycle += product.price * item.quantityKg;
        resolvedItems.push({
          product:      product._id,
          productName:  product.name,
          quantityKg:   item.quantityKg,
          unit:         product.unit,
          pricePerUnit: product.price,
        });
      }

      const nextDeliveryDate = computeNextDelivery(frequency, deliveryDays, new Date(startDate));

      const sub = await Subscription.create({
        buyer: req.user.id,
        name,
        items: resolvedItems,
        frequency,
        deliveryDays: deliveryDays || [],
        deliverySlot: deliverySlot || '6am-9am',
        shippingAddress,
        startDate,
        endDate,
        nextDeliveryDate,
        paymentMethod: paymentMethod || 'cod',
        totalPerCycle,
        status: 'active',
      });

      res.status(201).json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/subscriptions/:id/pause — pause a subscription ────────────────
router.patch('/:id/pause', verifyToken, async (req, res, next) => {
  try {
    const { pauseUntil } = req.body;
    const sub = await Subscription.findOne({ _id: req.params.id, buyer: req.user.id });
    if (!sub) throw new AppError('Subscription not found', 404);

    sub.status      = 'paused';
    sub.pausedUntil = pauseUntil ? new Date(pauseUntil) : null;
    await sub.save();

    res.json({ success: true, message: 'Subscription paused.', data: sub });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/subscriptions/:id/resume ──────────────────────────────────────
router.patch('/:id/resume', verifyToken, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, buyer: req.user.id });
    if (!sub) throw new AppError('Subscription not found', 404);

    sub.status              = 'active';
    sub.pausedUntil         = null;
    sub.nextDeliveryDate    = computeNextDelivery(sub.frequency, sub.deliveryDays);
    await sub.save();

    res.json({ success: true, message: 'Subscription resumed.', data: sub });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/subscriptions/:id — cancel ────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, buyer: req.user.id });
    if (!sub) throw new AppError('Subscription not found', 404);
    sub.status = 'cancelled';
    await sub.save();
    res.json({ success: true, message: 'Subscription cancelled.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;