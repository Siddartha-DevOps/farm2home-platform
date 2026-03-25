const farmerRouter = require("express").Router();
const { Farmer, Order: FOrder, Product: FProd } = require("../models");
const { protect: authF, requireFarmer: reqF, requireAdmin: adminF } = require("../middleware/auth");
 
// GET /api/farmers — List farmers
farmerRouter.get("/", async (req, res) => {
  try {
    const farmers = await Farmer.find({ isVerified: true })
      .populate("user", "name avatar").sort({ rating: -1 });
    res.json({ success: true, farmers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// GET /api/farmers/dashboard — Farmer's dashboard stats
farmerRouter.get("/dashboard", authF, reqF, async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user: req.user._id });
    if (!farmer) return res.status(404).json({ success: false, message: "Farmer profile not found" });
 
    const [products, orders] = await Promise.all([
      FProd.find({ farmer: farmer._id }),
      FOrder.find({ "items.farmer": farmer._id }).sort({ createdAt: -1 }).limit(10),
    ]);
 
    const totalRevenue = orders
      .filter(o => o.status === "delivered")
      .reduce((s, o) => s + o.items.filter(i => i.farmer.toString() === farmer._id.toString()).reduce((ss, i) => ss + i.subtotal, 0), 0);
 
    const pendingOrders = orders.filter(o => ["ordered", "confirmed", "packed"].includes(o.status)).length;
 
    res.json({
      success: true,
      stats: { totalRevenue, totalOrders: orders.length, pendingOrders, totalProducts: products.length },
      products, recentOrders: orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// PATCH /api/farmers/profile — Update farmer profile
farmerRouter.patch("/profile", authF, reqF, async (req, res) => {
  try {
    const farmer = await Farmer.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });
    res.json({ success: true, farmer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
 
module.exports.farmerRouter = farmerRouter;
