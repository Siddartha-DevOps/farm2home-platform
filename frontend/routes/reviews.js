const reviewRouter = require("express").Router();
const { Review, Product: RProd } = require("../models");
const { protect: authR } = require("../middleware/auth");
 
reviewRouter.post("/", authR, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;
 
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: "You have already reviewed this product" });
 
    const review = await Review.create({
      product: productId, user: req.user._id, order: orderId, rating, title, comment, images
    });
 
    // Recalculate product rating
    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    if (stats.length) {
      await RProd.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].count
      });
    }
 
    await review.populate("user", "name avatar");
    res.status(201).json({ success: true, message: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.reviewRouter = reviewRouter;
