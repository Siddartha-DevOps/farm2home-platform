const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats
} = require("../controllers/orderController");

// POST create order
router.post("/", createOrder);

// GET user orders
router.get("/user/:userId", getUserOrders);

// GET order stats
router.get("/user/:userId/stats", getOrderStats);

// GET order by ID
router.get("/:id", getOrderById);

// PUT update order status
router.put("/:id/status", updateOrderStatus);

// PUT update payment status
router.put("/:id/payment", updatePaymentStatus);

// PUT cancel order
router.put("/:id/cancel", cancelOrder);

module.exports = router;
