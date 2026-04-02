// bulkOrders.js
// Hotels, wholesalers, retailers place and negotiate bulk orders
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const BulkOrder = require('../models/BulkOrder');

// ── GET /api/bulk-orders — list bulk orders (buyer: own; admin: all) ──────────
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = req.user.role === 'admin' ? {} : { buyer: req.user.id };
    if (status) filter.status = status;

    const orders = await BulkOrder.find(filter)
      .populate('buyer', 'name email phone')
      .populate('assignedFarmers.farmer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: orders, total: await BulkOrder.countDocuments(filter) });
  } catch (err) { next(err); }
});

// ── POST /api/bulk-orders — create a bulk order ───────────────────────────────
router.post(
  '/',
  verifyToken,
  [
    body('buyerType').isIn(['household','retailer','hotel','wholesaler']).withMessage('Invalid buyer type'),
    body('buyerName').notEmpty().withMessage('Buyer / business name required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.productName').notEmpty().withMessage('Product name required'),
    body('items.*.quantityKg').isFloat({ min: 1 }).withMessage('Quantity must be ≥ 1'),
    body('deliveryDate').isISO8601().withMessage('Delivery date required'),
    body('deliveryAddress.city').notEmpty().withMessage('City required'),
    body('deliveryAddress.pincode').matches(/^\d{6}$/).withMessage('Invalid pincode'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { buyerType, buyerName, items, deliveryDate, deliveryAddress, specialInstructions } = req.body;

      const totalQuantityKg = items.reduce((sum, i) => sum + i.quantityKg, 0);

      const order = await BulkOrder.create({
        buyer: req.user.id,
        buyerType,
        buyerName,
        items: items.map((i) => ({
          productName:    i.productName,
          quantityKg:     i.quantityKg,
          unit:           i.unit || 'kg',
          requestedPrice: i.requestedPrice,
        })),
        totalQuantityKg,
        deliveryDate,
        deliveryAddress,
        specialInstructions,
        status: 'submitted',
      });

      // TODO: Notify admin to start matching farmers
      // notificationService.notifyAdminNewBulkOrder(order);

      res.status(201).json({ success: true, data: order });
    } catch (err) { next(err); }
  }
);

// ── POST /api/bulk-orders/:id/negotiate — add a message to the negotiation log
router.post(
  '/:id/negotiate',
  verifyToken,
  [body('message').notEmpty().withMessage('Message is required')],
  validate,
  async (req, res, next) => {
    try {
      const order = await BulkOrder.findById(req.params.id);
      if (!order) throw new AppError('Bulk order not found', 404);

      order.negotiations.push({
        by:      req.user.id,
        role:    req.user.role,
        message: req.body.message,
      });
      order.status = 'negotiating';
      await order.save();

      res.json({ success: true, message: 'Message added to negotiation.', data: order.negotiations });
    } catch (err) { next(err); }
  }
);

// ── PATCH /api/bulk-orders/:id/assign-farmers — admin assigns farmers ─────────
router.patch(
  '/:id/assign-farmers',
  verifyToken,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { assignments } = req.body;
      // assignments = [{ farmerId, items: [{productName, quantityKg, agreedPrice}] }]

      const order = await BulkOrder.findById(req.params.id);
      if (!order) throw new AppError('Bulk order not found', 404);

      order.assignedFarmers = assignments.map((a) => ({
        farmer: a.farmerId,
        items:  a.items,
        status: 'pending',
      }));
      order.status = 'confirmed';
      await order.save();

      res.json({ success: true, message: 'Farmers assigned.', data: order });
    } catch (err) { next(err); }
  }
);

// ── PATCH /api/bulk-orders/:id/farmer-response — farmer accepts/rejects ───────
router.patch(
  '/:id/farmer-response',
  verifyToken,
  requireRole('farmer'),
  [body('action').isIn(['accepted','rejected']).withMessage('action must be accepted or rejected')],
  validate,
  async (req, res, next) => {
    try {
      const order = await BulkOrder.findById(req.params.id);
      if (!order) throw new AppError('Bulk order not found', 404);

      const assignment = order.assignedFarmers.find(
        (a) => a.farmer.toString() === req.user.id
      );
      if (!assignment) throw new AppError('You are not assigned to this order', 403);

      assignment.status = req.body.action;
      assignment.notes  = req.body.notes;
      await order.save();

      res.json({ success: true, message: `Bulk order ${req.body.action}.` });
    } catch (err) { next(err); }
  }
);

module.exports = router;