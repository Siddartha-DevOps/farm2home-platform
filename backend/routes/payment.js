// backend/routes/payments.js
// npm install razorpay crypto
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /api/payments/create-order — create Razorpay order ──────────────────
// Call this AFTER creating the order in /api/orders
router.post('/create-order', verifyToken, async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user.toString() !== req.user.id) throw new AppError('Forbidden', 403);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      notes: { orderId: orderId.toString(), userId: req.user.id },
    });

    // Save Razorpay order id on our order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/payments/verify — verify signature after payment ────────────────
router.post('/verify', verifyToken, async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // HMAC-SHA256 signature verification
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new AppError('Payment verification failed. Invalid signature.', 400);
    }

    // Mark order as paid
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId,
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!order) throw new AppError('Order not found', 404);

    res.json({ success: true, message: 'Payment verified successfully', data: order });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/payments/webhook — Razorpay server-to-server webhook ────────────
// Add this URL in Razorpay dashboard → Settings → Webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const event = JSON.parse(req.body);

  if (event.event === 'payment.captured') {
    const { order_id, id: paymentId } = event.payload.payment.entity;
    await Order.findOneAndUpdate(
      { razorpayOrderId: order_id },
      { paymentStatus: 'paid', status: 'confirmed', razorpayPaymentId: paymentId }
    );
  }

  if (event.event === 'payment.failed') {
    const { order_id } = event.payload.payment.entity;
    await Order.findOneAndUpdate({ razorpayOrderId: order_id }, { paymentStatus: 'failed' });
  }

  res.json({ received: true });
});

module.exports = router;
