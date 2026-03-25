const Order = require("../models/order");

// Create new order
const createOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice, discount, shippingAddress, paymentMethod } = req.body;

    if (!userId || !items || !totalPrice || !shippingAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const finalPrice = totalPrice - (discount || 0);

    const order = new Order({
      userId,
      items,
      totalPrice,
      discount: discount || 0,
      finalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || "cash_on_delivery",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all orders for a user
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    if (!["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        trackingNumber: trackingNumber || order?.trackingNumber,
        notes: notes || order?.notes
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["pending", "completed", "failed"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({ message: "Cannot cancel orders that have been shipped or delivered" });
    }

    order.status = "cancelled";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Order.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$finalPrice" },
          averageOrderValue: { $avg: "$finalPrice" },
          statusBreakdown: {
            $push: {
              status: "$status",
              count: 1
            }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      statusBreakdown: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats
};
