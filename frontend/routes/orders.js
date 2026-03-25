const orderRouter = require("express").Router();
const { Order, Product: OProd, Cart: OCart, Farmer: OFarmer, Notification: ONoti } = require("../models");
const { protect: authO, requireAdmin: adminO, requireFarmer: farmerO } = require("../middleware/auth");
 
// POST /api/orders — Place Order
orderRouter.post("/", authO, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, couponCode } = req.body;
    const io = req.app.get("io");
 
    // Validate and calculate
    let subtotal = 0;
    const orderItems = [];
 
    for (const item of items) {
      const product = await OProd.findById(item.productId).populate("farmer");
      if (!product || !product.isActive)
        return res.status(400).json({ success: false, message: `Product ${item.productId} not available` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
 
      const finalPrice = product.price * (1 - product.discount / 100);
      const itemSubtotal = finalPrice * item.quantity;
      subtotal += itemSubtotal;
 
      orderItems.push({
        product: product._id,
        farmer:  product.farmer._id,
        name:    product.name,
        image:   product.images[0] || "",
        price:   finalPrice,
        discount:product.discount,
        quantity:item.quantity,
        unit:    product.unit,
        subtotal:itemSubtotal,
      });
 
      // Decrement stock
      await OProd.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }
 
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + deliveryFee;
 
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      payment: { method: paymentMethod, status: paymentMethod === "cod" ? "pending" : "pending" },
      status: "ordered",
      statusHistory: [{ status: "ordered", note: "Order placed by customer" }],
      subtotal, deliveryFee, total,
    });
 
    // Clear cart
    await OCart.findOneAndUpdate({ user: req.user._id }, { items: [] });
 
    // Notify customer
    await ONoti.create({
      user: req.user._id, type: "order_update",
      title: "Order Placed! 🎉",
      message: `Your order #${order.orderId} has been placed. Total: ₹${total}`,
      data: { orderId: order._id }, icon: "📦"
    });
 
    // Real-time: notify relevant farmers
    const farmerIds = [...new Set(orderItems.map(i => i.farmer.toString()))];
    farmerIds.forEach(fId => {
      io.to(`farmer_${fId}`).emit("new_order", {
        message: "You have a new order!", orderId: order.orderId
      });
    });
 
    // Real-time: notify customer
    io.to(`user_${req.user._id}`).emit("order_confirmed", { order });
 
    res.status(201).json({ success: true, message: "Order placed!", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// GET /api/orders — Customer's orders
orderRouter.get("/", authO, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
 
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(+limit)
      .populate("items.product", "name images");
 
    const total = await Order.countDocuments(filter);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// GET /api/orders/:id — Order detail
orderRouter.get("/:id", authO, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name images unit")
      .populate("items.farmer", "farmName location user")
      .populate("user", "name email phone");
 
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
 
    // Allow access to order owner, relevant farmer, or admin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin  = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized" });
 
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// PATCH /api/orders/:id/status — Farmer / Admin updates order status
orderRouter.patch("/:id/status", authO, async (req, res) => {
  try {
    const { status, note } = req.body;
    const io = req.app.get("io");
    const validStatuses = ["confirmed", "packed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });
 
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
 
    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    if (status === "delivered") order.payment.status = "paid";
    await order.save();
 
    // Notify customer
    const notification = await ONoti.create({
      user: order.user, type: "order_update",
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order #${order.orderId} is now ${status}.`,
      data: { orderId: order._id }, icon: status === "delivered" ? "🏡" : "🚚"
    });
 
    io.to(`user_${order.user}`).emit("order_status_update", { orderId: order._id, status, notification });
 
    res.json({ success: true, message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// GET /api/orders/farmer/mine — Farmer's incoming orders
orderRouter.get("/farmer/mine", authO, farmerO, async (req, res) => {
  try {
    const { Farmer: FarmerModel } = require("../models");
    const farmer = await FarmerModel.findOne({ user: req.user._id });
    if (!farmer) return res.status(404).json({ success: false, message: "Farmer profile not found" });
 
    const { page = 1, limit = 20, status } = req.query;
    const filter = { "items.farmer": farmer._id };
    if (status) filter.status = status;
 
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(+limit)
      .populate("user", "name phone");
 
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.orderRouter = orderRouter;
