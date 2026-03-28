// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

// ── Models (adjust import path to match your ORM/ODM) ─────────────────────────
const Order = require('../models/Order');
const Product = require('../models/Product');

// ── Validation rules ──────────────────────────────────────────────────────────
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('productId is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be ≥ 1'),
  body('shippingAddress.street').notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required'),
  body('paymentMethod').isIn(['cod', 'online']).withMessage('paymentMethod must be cod or online'),
];

// ── POST /api/orders — place a new order ──────────────────────────────────────
router.post('/', verifyToken, orderValidation, validate, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Fetch products and compute total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity)
        throw new AppError(`Insufficient stock for ${product.name}`, 400);

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'awaiting',
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/orders — buyer sees own orders ───────────────────────────────────
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('items.product', 'name images');

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/orders/:id — get single order ────────────────────────────────────
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) throw new AppError('Order not found', 404);

    // Buyers can only see their own orders; admins/farmers see all
    if (req.user.role === 'buyer' && order.user.toString() !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/orders/:id/status — farmer or admin updates order status ───────
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('farmer', 'admin'),
  body('status')
    .isIn(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  validate,
  async (req, res, next) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status, updatedAt: Date.now() },
        { new: true }
      );
      if (!order) throw new AppError('Order not found', 404);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/orders/:id — cancel order (buyer, only if pending) ────────────
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user.toString() !== req.user.id) throw new AppError('Forbidden', 403);
    if (order.status !== 'pending') throw new AppError('Only pending orders can be cancelled', 400);

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
