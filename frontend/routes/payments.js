const paymentRouter = require("express").Router();
const { Order: PayOrder } = require("../models");
const { protect: authP } = require("../middleware/auth");
const crypto2 = require("crypto");
 
let Razorpay;
try {
  Razorpay = require("razorpay");
} catch (_) {
  console.warn("⚠️  Razorpay package not installed. Install with: npm install razorpay");
}
 
const getRazorpay = () => {
  if (!Razorpay) throw new Error("Razorpay not installed");
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};
 
// POST /api/payments/create-order
paymentRouter.post("/create-order", authP, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await PayOrder.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
 
    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(order.total * 100), // paise
      currency: "INR",
      receipt:  order.orderId,
      notes:    { orderId: order._id.toString(), userId: req.user._id.toString() }
    });
 
    order.payment.razorpayOrderId = rzpOrder.id;
    await order.save();
 
    res.json({
      success: true,
      razorpayOrder: rzpOrder,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.total,
      currency: "INR",
      name: "Farm2Home",
      description: `Order #${order.orderId}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// POST /api/payments/verify
paymentRouter.post("/verify", authP, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
 
    const expectedSignature = crypto2
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
 
    if (expectedSignature !== razorpaySignature)
      return res.status(400).json({ success: false, message: "Payment verification failed" });
 
    const order = await PayOrder.findByIdAndUpdate(orderId, {
      "payment.status": "paid",
      "payment.razorpayPaymentId": razorpayPaymentId,
      "payment.razorpaySignature": razorpaySignature,
      "payment.paidAt": new Date(),
      status: "confirmed",
      $push: { statusHistory: { status: "confirmed", note: "Payment verified" } }
    }, { new: true });
 
    res.json({ success: true, message: "Payment verified", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// POST /api/payments/webhook — Razorpay webhook
paymentRouter.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body.toString();
    const expectedSig = crypto2
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body).digest("hex");
 
    if (signature !== expectedSig)
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
 
    const event = JSON.parse(body);
    console.log("📡 Razorpay Webhook:", event.event);
    // Handle payment.captured, payment.failed, refund.created etc.
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
const express2 = require("express");
module.exports.paymentRouter = paymentRouter;
 
 
