const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeItem
} = require("../controllers/cartController");

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.delete("/remove", removeItem);

module.exports = router;
