const cartRouter = require("express").Router();
const { Cart, Product: Prod } = require("../models");
const { protect: authC } = require("../middleware/auth");
 
// GET /api/cart
cartRouter.get("/", authC, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// POST /api/cart/add
cartRouter.post("/add", authC, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Prod.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: "Insufficient stock" });
 
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
 
    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) existing.quantity += quantity;
    else cart.items.push({ product: productId, quantity });
 
    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, message: "Added to cart", cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// PATCH /api/cart/update
cartRouter.patch("/update", authC, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
 
    if (quantity <= 0) cart.items = cart.items.filter(i => i.product.toString() !== productId);
    else {
      const item = cart.items.find(i => i.product.toString() === productId);
      if (item) item.quantity = quantity;
    }
 
    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// DELETE /api/cart/clear
cartRouter.delete("/clear", authC, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.cartRouter = cartRouter;
