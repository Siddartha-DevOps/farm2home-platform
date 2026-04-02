// demandAlerts.js
// Buyers/admin post demand; farmers respond; notifications sent
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');

const DemandAlert  = require('../models/DemandAlert');
const FarmerProfile = require('../models/FarmerProfile');

// ── GET /api/demand-alerts — list open alerts (farmers see alerts near them) ──
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { crop, city, status = 'open', page = 1, limit = 20 } = req.query;

    const filter = { status };
    if (crop) filter.cropName = new RegExp(crop, 'i');
    if (city) filter.deliveryCity = new RegExp(city, 'i');

    const alerts = await DemandAlert.find(filter)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await DemandAlert.countDocuments(filter);

    res.json({
      success: true,
      data: alerts,
      pagination: { page: Number(page), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/demand-alerts — buyer or admin creates a demand alert ────────────
router.post(
  '/',
  verifyToken,
  requireRole('buyer', 'admin'),
  [
    body('cropName').notEmpty().withMessage('Crop name is required'),
    body('quantityKg').isFloat({ min: 1 }).withMessage('Quantity must be > 0'),
    body('offerPrice').isFloat({ min: 0.01 }).withMessage('Offer price is required'),
    body('neededBy').isISO8601().withMessage('neededBy must be a valid date'),
    body('deliveryCity').notEmpty().withMessage('Delivery city is required'),
    body('buyerType').isIn(['household','retailer','hotel','wholesaler']).withMessage('Invalid buyer type'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { cropName, quantityKg, offerPrice, neededBy, deliveryCity, deliveryState, buyerType, buyerName, isOrganic, radiusKm } = req.body;

      const alert = await DemandAlert.create({
        postedBy: req.user.id,
        cropName,
        quantityKg,
        offerPrice,
        neededBy,
        deliveryCity,
        deliveryState,
        buyerType,
        buyerName,
        isOrganic: isOrganic || false,
        radiusKm:  radiusKm || 100,
        expiresAt: new Date(neededBy),
      });

      // TODO: Push notification to nearby farmers
      // notifyFarmersNearby(alert);

      res.status(201).json({ success: true, data: alert });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/demand-alerts/:id/respond — farmer responds to a demand ─────────
router.post(
  '/:id/respond',
  verifyToken,
  requireRole('farmer'),
  [
    body('offeredPrice').isFloat({ min: 0.01 }).withMessage('Offer price required'),
    body('offeredQtyKg').isFloat({ min: 1 }).withMessage('Quantity required'),
    body('message').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const alert = await DemandAlert.findById(req.params.id);
      if (!alert) throw new AppError('Demand alert not found', 404);
      if (alert.status !== 'open') throw new AppError('This demand is no longer open', 400);

      // Check if farmer already responded
      const alreadyResponded = alert.responses.some(
        (r) => r.farmer.toString() === req.user.id
      );
      if (alreadyResponded) throw new AppError('You have already responded to this demand', 409);

      alert.responses.push({
        farmer:       req.user.id,
        offeredPrice: req.body.offeredPrice,
        offeredQtyKg: req.body.offeredQtyKg,
        message:      req.body.message,
      });

      // Update status if demand partially covered
      const totalOffered = alert.responses.reduce((sum, r) => sum + (r.offeredQtyKg || 0), 0);
      if (totalOffered >= alert.quantityKg) alert.status = 'partially_filled';

      await alert.save();

      res.json({ success: true, message: 'Response submitted. Buyer will be notified.' });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/demand-alerts/:id/responses/:responseId — buyer accepts/rejects farmer response
router.patch(
  '/:id/responses/:responseId',
  verifyToken,
  [body('action').isIn(['accepted', 'rejected']).withMessage('action must be accepted or rejected')],
  validate,
  async (req, res, next) => {
    try {
      const alert = await DemandAlert.findById(req.params.id);
      if (!alert) throw new AppError('Alert not found', 404);
      if (alert.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Forbidden', 403);
      }

      const response = alert.responses.id(req.params.responseId);
      if (!response) throw new AppError('Response not found', 404);

      response.status = req.body.action;
      await alert.save();

      res.json({ success: true, message: `Response ${req.body.action}.` });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/demand-alerts/my-responses — farmer sees their own responses ─────
router.get('/my-responses', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const alerts = await DemandAlert.find({ 'responses.farmer': req.user.id })
      .select('cropName quantityKg offerPrice neededBy deliveryCity status responses')
      .lean();

    const result = alerts.map((a) => ({
      ...a,
      myResponse: a.responses.find((r) => r.farmer.toString() === req.user.id),
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;