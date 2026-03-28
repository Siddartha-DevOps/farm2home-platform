// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ── GET /api/cart — get current user's cart ───────────────────────────────────
router.get('/', verifyToken, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'name price images stock unit'
    );

    if (!cart) {
      cart = { user: req.user.id, items: [], totalAmount: 0 };
    }

    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/cart/items — add item to cart ───────────────────────────────────
router.post(
  '/items',
  verifyToken,
  [
    body('productId').notEmpty().withMessage('productId is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be ≥ 1'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product) throw new AppError('Product not found', 404);
      if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

      let cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        cart = new Cart({ user: req.user.id, items: [] });
      }

      const existingItem = cart.items.find((i) => i.product.toString() === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }

      cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      await cart.save();

      await cart.populate('items.product', 'name price images stock unit');
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/cart/items/:productId — update quantity ────────────────────────
router.patch(
  '/items/:productId',
  verifyToken,
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be ≥ 0 (0 removes the item)'),
  validate,
  async (req, res, next) => {
    try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) throw new AppError('Cart not found', 404);

      const { quantity } = req.body;
      const { productId } = req.params;

      if (quantity === 0) {
        cart.items = cart.items.filter((i) => i.product.toString() !== productId);
      } else {
        const item = cart.items.find((i) => i.product.toString() === productId);
        if (!item) throw new AppError('Item not in cart', 404);
        item.quantity = quantity;
      }

      cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      await cart.save();

      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/cart/items/:productId — remove single item ───────────────────
router.delete('/items/:productId', verifyToken, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new AppError('Cart not found', 404);

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/cart — clear entire cart ──────────────────────────────────────
router.delete('/', verifyToken, async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
