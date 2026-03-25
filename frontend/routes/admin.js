const adminRouter = require("express").Router();
const { User: AUser, Farmer: AFarmer, Product: AProd, Order: AOrder } = require("../models");
const { protect: authA, requireAdmin: adminA } = require("../middleware/auth");
 
// GET /api/admin/dashboard
adminRouter.get("/dashboard", authA, adminA, async (req, res) => {
  try {
    const [users, farmers, products, orders] = await Promise.all([
      AUser.countDocuments(), AFarmer.countDocuments(),
      AProd.countDocuments({ isActive: true }), AOrder.countDocuments(),
    ]);
 
    const revenue = await AOrder.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
 
    const recentOrders = await AOrder.find()
      .sort({ createdAt: -1 }).limit(10)
      .populate("user", "name email");
 
    res.json({
      success: true,
      stats: { users, farmers, products, orders, totalRevenue: revenue[0]?.total || 0 },
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// GET /api/admin/users
adminRouter.get("/users", authA, adminA, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
 
    const users = await AUser.find(filter).skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 });
    const total = await AUser.countDocuments(filter);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// PATCH /api/admin/users/:id/toggle-status
adminRouter.patch("/users/:id/toggle-status", authA, adminA, async (req, res) => {
  try {
    const user = await AUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "suspended"}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// PATCH /api/admin/farmers/:id/verify
adminRouter.patch("/farmers/:id/verify", authA, adminA, async (req, res) => {
  try {
    const farmer = await AFarmer.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!farmer) return res.status(404).json({ success: false, message: "Farmer not found" });
    res.json({ success: true, message: "Farmer verified", farmer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.adminRouter = adminRouter;
