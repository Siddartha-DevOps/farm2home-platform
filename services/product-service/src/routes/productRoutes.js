const express = require("express");
const router = express.Router();

let products = [];

router.get("/", (req, res) => {
  res.json(products);
});

router.post("/", (req, res) => {
  const product = req.body;
  products.push(product);
  res.status(201).json(product);
});

module.exports = router;
