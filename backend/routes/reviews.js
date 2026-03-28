// backend/routes/reviews.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams for /products/:productId/reviews
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const Review = require('../models/Review');
const Product = require('../models/Product');

// ── GET /api/products/:productId/reviews ──────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.json({ success: true, data: reviews, avgRating, count: reviews.length });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/products/:productId/reviews ─────────────────────────────────────
router.post(
  '/',
  verifyToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().isLength({ min: 10 }).withMessage('Comment must be at least 10 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId);
      if (!product) throw new AppError('Product not found', 404);

      // One review per user per product
      const existingReview = await Review.findOne({ product: productId, user: req.user.id });
      if (existingReview) throw new AppError('You have already reviewed this product', 409);

      const review = await Review.create({
        product: productId,
        user: req.user.id,
        rating: req.body.rating,
        comment: req.body.comment,
      });

      // Update product average rating
      const reviews = await Review.find({ product: productId });
      product.avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      product.reviewCount = reviews.length;
      await product.save();

      await review.populate('user', 'name avatar');
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/products/:productId/reviews/:reviewId ────────────────────────
router.delete('/:reviewId', verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) throw new AppError('Review not found', 404);
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Forbidden', 403);
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
