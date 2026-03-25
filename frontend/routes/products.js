const productRouter = require("express").Router();
const { Product, Review } = require("../models");
const { protect: auth, requireFarmer, optionalAuth } = require("../middleware/auth");
 
// GET /api/products — List with filter, search, pagination
productRouter.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1, limit = 12, category, organic, farmer,
      minPrice, maxPrice, sortBy = "rating", q, featured
    } = req.query;
 
    const filter = { isActive: true };
    if (category)  filter.category = category;
    if (organic)   filter.isOrganic = organic === "true";
    if (farmer)    filter.farmer = farmer;
    if (featured)  filter.isFeatured = featured === "true";
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = +minPrice;
      if (maxPrice) filter.price.$lte = +maxPrice;
    }
    if (q) filter.$text = { $search: q };
 
    const sortMap = {
      rating: { rating: -1 }, newest: { createdAt: -1 },
      price_asc: { price: 1 }, price_desc: { price: -1 }, popular: { totalReviews: -1 }
    };
 
    const skip = (page - 1) * limit;
 
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sortBy] || { rating: -1 })
        .skip(skip).limit(+limit)
        .populate("farmer", "farmName location rating user"),
      Product.countDocuments(filter)
    ]);
 
    res.json({
      success: true,
      products, total,
      pages: Math.ceil(total / limit),
      currentPage: +page
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// GET /api/products/:id
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("farmer", "farmName location rating certifications user coverImage");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
 
    const reviews = await Review.find({ product: product._id })
      .populate("user", "name avatar").sort({ createdAt: -1 }).limit(10);
 
    res.json({ success: true, product, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// POST /api/products — Farmer creates product
productRouter.post("/", auth, requireFarmer, async (req, res) => {
  try {
    const { Farmer } = require("../models");
    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) return res.status(404).json({ success: false, message: "Farmer profile not found" });
 
    const product = await Product.create({ ...req.body, farmer: farmer._id });
    res.status(201).json({ success: true, message: "Product created", product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
 
// PATCH /api/products/:id
productRouter.patch("/:id", auth, requireFarmer, async (req, res) => {
  try {
    const { Farmer } = require("../models");
    const farmer = await Farmer.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, farmer: farmer._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
 
    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, message: "Product updated", product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
 
// DELETE /api/products/:id
productRouter.delete("/:id", auth, requireFarmer, async (req, res) => {
  try {
    const { Farmer } = require("../models");
    const farmer = await Farmer.findOne({ user: req.user._id });
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: farmer._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.productRouter = productRouter;
