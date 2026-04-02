// admin/index.js
// Admin-only routes — farmer verification, product moderation, analytics
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { AppError } = require('../../middleware/errorHandler');

const FarmerProfile    = require('../../models/FarmerProfile');
const Product          = require('../../models/Product');
const Order            = require('../../models/Order');
const User             = require('../../models/User');
const BulkOrder        = require('../../models/BulkOrder');

// All routes in this file require admin role
router.use(verifyToken, requireRole('admin'));

// ════════════════════════════════════════════════════════════════════════
// FARMER VERIFICATION
// ════════════════════════════════════════════════════════════════════════

// GET /api/admin/farmers — list all farmers by verification status
router.get('/farmers', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;

    const farmers = await FarmerProfile.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FarmerProfile.countDocuments(filter);

    res.json({ success: true, data: farmers, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// PATCH /api/admin/farmers/:profileId/verify — approve or reject a farmer
router.patch(
  '/farmers/:profileId/verify',
  [
    body('action').isIn(['approved', 'rejected']).withMessage('action must be approved or rejected'),
    body('note').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { action, note } = req.body;
      const profile = await FarmerProfile.findByIdAndUpdate(
        req.params.profileId,
        {
          verificationStatus: action,
          verificationNote:   note,
          verifiedByAdmin:    req.user.id,
          ...(action === 'approved' && { 'aadhaar.verified': true, 'aadhaar.verifiedAt': new Date() }),
        },
        { new: true }
      ).populate('user', 'name email');

      if (!profile) throw new AppError('Farmer profile not found', 404);

      // TODO: Send email/SMS to farmer about verification result
      // notificationService.sendFarmerVerificationResult(profile.user.email, action, note);

      res.json({ success: true, message: `Farmer ${action}.`, data: profile });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════════════
// PRODUCT MODERATION
// ════════════════════════════════════════════════════════════════════════

// GET /api/admin/products — all products with moderation filter
router.get('/products', async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status === 'inactive') filter.is_active = false;
    if (status === 'active')   filter.is_active = true;
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: products, total: await Product.countDocuments(filter) });
  } catch (err) { next(err); }
});

// PATCH /api/admin/products/:id/moderate — approve / reject / flag a product
router.patch(
  '/products/:id/moderate',
  [
    body('action').isIn(['approve', 'reject', 'flag']).withMessage('Invalid action'),
    body('reason').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { action, reason } = req.body;
      const update = {
        approve: { isActive: true,  moderationStatus: 'approved', moderationNote: '' },
        reject:  { isActive: false, moderationStatus: 'rejected', moderationNote: reason },
        flag:    { isActive: false, moderationStatus: 'flagged',  moderationNote: reason },
      }[action];

      const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!product) throw new AppError('Product not found', 404);

      res.json({ success: true, message: `Product ${action}d.`, data: product });
    } catch (err) { next(err); }
  }
);

// ════════════════════════════════════════════════════════════════════════
// LOGISTICS COORDINATION
// ════════════════════════════════════════════════════════════════════════

// GET /api/admin/logistics — all orders needing logistics assignment
router.get('/logistics', async (req, res, next) => {
  try {
    const orders = await Order.find({ status: { $in: ['confirmed', 'packed'] } })
      .populate('user', 'name phone')
      .populate('items.product', 'name farmer')
      .sort({ createdAt: 1 });             // oldest first — assign first

    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

// PATCH /api/admin/logistics/:orderId/assign — assign delivery partner
router.patch('/logistics/:orderId/assign', async (req, res, next) => {
  try {
    const { deliveryPartnerName, deliveryPartnerPhone, vehicleNumber, estimatedDelivery } = req.body;

    const DeliveryTracking = require('../../models/DeliveryTracking');
    const tracking = await DeliveryTracking.findOneAndUpdate(
      { order: req.params.orderId },
      {
        deliveryPartner: { name: deliveryPartnerName, phone: deliveryPartnerPhone, vehicleNumber },
        estimatedDeliveryTime: estimatedDelivery ? new Date(estimatedDelivery) : null,
        currentStatus: 'in_transit',
        $push: { timeline: { status: 'in_transit', description: `Assigned to ${deliveryPartnerName}`, timestamp: new Date() } },
      },
      { new: true }
    );

    await Order.findByIdAndUpdate(req.params.orderId, { status: 'shipped' });

    res.json({ success: true, message: 'Delivery partner assigned.', data: tracking });
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════════════════════════════
// PAYMENT MANAGEMENT
// ════════════════════════════════════════════════════════════════════════

// GET /api/admin/payments — all orders with payment info
router.get('/payments', async (req, res, next) => {
  try {
    const { paymentStatus, startDate, endDate, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', ...filter } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      data: orders,
      totalRevenue: totalRevenue[0]?.total || 0,
      total: await Order.countDocuments(filter),
    });
  } catch (err) { next(err); }
});

// POST /api/admin/payments/:orderId/refund — issue refund
router.post('/payments/:orderId/refund', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.paymentStatus !== 'paid') throw new AppError('Order not paid — cannot refund', 400);

    // TODO: call Razorpay refund API
    // const razorpay = new Razorpay({ key_id, key_secret });
    // await razorpay.payments.refund(order.razorpayPaymentId, { amount: order.totalAmount * 100 });

    order.paymentStatus = 'refunded';
    await order.save();

    res.json({ success: true, message: 'Refund initiated.', data: order });
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════════════════════

// GET /api/admin/analytics — platform-wide KPIs
router.get('/analytics', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const days = parseInt(period) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      revenueByCategory,
      ordersByStatus,
      newUsers,
      topProducts,
      farmerStats,
    ] = await Promise.all([
      // Total revenue in period
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: since } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),

      // Revenue by product category
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: since } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' } },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$productInfo.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } },
      ]),

      // Orders grouped by status
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // New user signups
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // Top 10 selling products
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      // Farmer performance
      FarmerProfile.find()
        .populate('user', 'name')
        .sort({ 'stats.totalRevenue': -1 })
        .limit(10)
        .select('user farmName stats verificationStatus'),
    ]);

    res.json({
      success: true,
      data: {
        period: `${days}d`,
        revenue: {
          total:         totalRevenue[0]?.total || 0,
          ordersCount:   totalRevenue[0]?.count || 0,
          byCategory:    revenueByCategory,
        },
        orders:   ordersByStatus,
        newUsers,
        topProducts,
        topFarmers: farmerStats,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;