const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct
} = require("../controllers/productController");

// GET all products
router.get("/", getAllProducts);

// GET product by ID
router.get("/:id", getProductById);

// POST create product
router.post("/", createProduct);


module.exports = router;
