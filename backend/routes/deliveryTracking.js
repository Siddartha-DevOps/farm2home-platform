// deliveryTracking.js
// Swiggy/Zomato-style real-time delivery tracking
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const DeliveryTracking = require('../models/DeliveryTracking');
const Order            = require('../models/Order');

// All status stages in order
const STAGE_LABELS = {
  order_placed:       'Order placed',
  farmer_confirmed:   'Farmer confirmed your order',
  being_packed:       'Order is being packed',
  picked_up:          'Picked up from farm',
  in_transit:         'On the way to you',
  out_for_delivery:   'Out for delivery',
  delivered:          'Delivered',
  delivery_failed:    'Delivery attempted — contact support',
};

// ── GET /api/delivery/:orderId — get tracking info for an order ───────────────
router.get('/:orderId', verifyToken, async (req, res, next) => {
  try {
    const tracking = await DeliveryTracking.findOne({ order: req.params.orderId })
      .populate('order', 'status totalAmount items')
      .populate('farmer', 'name phone');

    if (!tracking) throw new AppError('Tracking info not found for this order', 404);

    // Buyers can only track their own orders
    if (req.user.role === 'buyer' && tracking.buyer.toString() !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }

    res.json({ success: true, data: tracking, stageLabel: STAGE_LABELS[tracking.currentStatus] });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/delivery — create tracking record when order is placed ──────────
// Called internally from orders.js after order creation
router.post(
  '/',
  verifyToken,
  [body('orderId').notEmpty(), body('buyerId').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { orderId, buyerId, farmerId, pickupAddress, deliveryAddress } = req.body;

      const tracking = await DeliveryTracking.create({
        order:           orderId,
        buyer:           buyerId,
        farmer:          farmerId,
        pickupAddress,
        deliveryAddress,
        currentStatus:   'order_placed',
        timeline: [{
          status:      'order_placed',
          description: STAGE_LABELS.order_placed,
          timestamp:   new Date(),
        }],
        // Generate 4-digit OTP for delivery confirmation
        deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      });

      res.status(201).json({ success: true, data: tracking });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/delivery/:orderId/status — update delivery stage ───────────────
// Used by farmer app or delivery partner app
router.patch(
  '/:orderId/status',
  verifyToken,
  requireRole('farmer', 'admin'),
  [
    body('status').isIn(Object.keys(STAGE_LABELS)).withMessage('Invalid status'),
    body('location').optional().isString(),
    body('lat').optional().isFloat(),
    body('lng').optional().isFloat(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { status, location, lat, lng } = req.body;
      const tracking = await DeliveryTracking.findOne({ order: req.params.orderId });
      if (!tracking) throw new AppError('Tracking record not found', 404);

      tracking.currentStatus = status;

      // Update live GPS location
      if (lat && lng) {
        tracking.currentLocation = { lat, lng, updatedAt: new Date() };
      }

      // Append to timeline
      tracking.timeline.push({
        status,
        description: STAGE_LABELS[status],
        location,
        timestamp: new Date(),
        coordinates: lat && lng ? { lat, lng } : undefined,
      });

      // Set actual delivery time when delivered
      if (status === 'delivered') {
        tracking.actualDeliveryTime = new Date();
        // Also update the order status
        await Order.findByIdAndUpdate(req.params.orderId, { status: 'delivered' });
      }

      await tracking.save();

      // TODO: Push WebSocket event to buyer's app
      // io.to(`order_${req.params.orderId}`).emit('trackingUpdate', tracking);

      res.json({ success: true, data: tracking });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/delivery/:orderId/verify-otp — confirm delivery with OTP ────────
router.post('/:orderId/verify-otp', verifyToken, async (req, res, next) => {
  try {
    const tracking = await DeliveryTracking.findOne({ order: req.params.orderId });
    if (!tracking) throw new AppError('Tracking not found', 404);
    if (tracking.deliveryOtp !== req.body.otp) throw new AppError('Invalid OTP', 400);
    if (tracking.otpVerified) throw new AppError('OTP already used', 400);

    tracking.otpVerified   = true;
    tracking.currentStatus = 'delivered';
    tracking.actualDeliveryTime = new Date();
    tracking.timeline.push({ status: 'delivered', description: 'Delivered — OTP verified', timestamp: new Date() });
    await tracking.save();

    await Order.findByIdAndUpdate(req.params.orderId, { status: 'delivered' });

    res.json({ success: true, message: 'Delivery confirmed.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/delivery/:orderId/live-location — delivery partner sends GPS ───
router.patch('/:orderId/live-location', verifyToken, async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    await DeliveryTracking.findOneAndUpdate(
      { order: req.params.orderId },
      { currentLocation: { lat, lng, updatedAt: new Date() } }
    );
    // TODO: emit via Socket.IO
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;