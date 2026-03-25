const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    organic: {
      type: Boolean,
      default: false
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    reviews: [
      {
        userId: String,
        userName: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
