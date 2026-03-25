const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
} = require("../controllers/productController");

// GET all products with filters
router.get("/", getAllProducts);

// GET product by ID
router.get("/:id", getProductById);

// POST create product
router.post("/", createProduct);

// PUT update product
router.put("/:id", updateProduct);

// DELETE product
router.delete("/:id", deleteProduct);

// POST add review to product
router.post("/:id/reviews", addReview);

module.exports = router;
