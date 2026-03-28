// backend/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // snapshot price at add-time
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);


// ─────────────────────────────────────────────────────────────────────────────
// backend/models/Review.js  — save this in a separate file
// ─────────────────────────────────────────────────────────────────────────────
// const mongoose = require('mongoose');
//
// const reviewSchema = new mongoose.Schema(
//   {
//     product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     rating: { type: Number, required: true, min: 1, max: 5 },
//     comment: { type: String, required: true },
//   },
//   { timestamps: true }
// );
//
// // Compound index prevents duplicate reviews
// reviewSchema.index({ product: 1, user: 1 }, { unique: true });
//
// module.exports = mongoose.model('Review', reviewSchema);
