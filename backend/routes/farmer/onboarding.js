// farmer/onboarding.js
// Handles: Aadhaar verification, farm location, crop types
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { AppError } = require('../../middleware/errorHandler');

const FarmerProfile = require('../../models/FarmerProfile');

// ── GET /api/farmer/onboarding — get current onboarding status ────────────────
router.get('/', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user.id })
      .select('-aadhaar.number -bankAccount.accountNumber -bankAccount.razorpayFundAccountId');

    res.json({
      success: true,
      data: profile,
      onboardingComplete: profile?.verificationStatus === 'approved',
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/farmer/onboarding/step1 — submit Aadhaar + farm basics ──────────
router.post(
  '/step1',
  verifyToken,
  requireRole('farmer'),
  [
    body('aadhaarNumber')
      .matches(/^\d{12}$/).withMessage('Aadhaar must be exactly 12 digits'),
    body('farmName').trim().notEmpty().withMessage('Farm name is required'),
    body('farmSizeAcres').isFloat({ min: 0.1 }).withMessage('Farm size must be > 0'),
    body('bio').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { aadhaarNumber, farmName, farmSizeAcres, bio } = req.body;

      // Mask Aadhaar: show only last 4 digits
      const maskedNumber = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;

      // TODO: Integrate real Aadhaar verification API (e.g. Digio, Karza, AuthBridge)
      // For now, mark as submitted for admin to verify manually
      const profile = await FarmerProfile.findOneAndUpdate(
        { user: req.user.id },
        {
          user: req.user.id,
          farmName,
          farmSizeCre: farmSizeAcres,
          bio,
          'aadhaar.number':       aadhaarNumber,   // store encrypted in production
          'aadhaar.maskedNumber': maskedNumber,
          'aadhaar.verified':     false,             // set to true after real API call
          verificationStatus:     'documents_submitted',
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: 'Step 1 submitted. Aadhaar pending verification.',
        data: { maskedAadhaar: maskedNumber, farmName, verificationStatus: profile.verificationStatus },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/farmer/onboarding/step2 — set farm GPS location ────────────────
router.post(
  '/step2',
  verifyToken,
  requireRole('farmer'),
  [
    body('address').notEmpty().withMessage('Address is required'),
    body('village').optional().trim(),
    body('district').notEmpty().withMessage('District is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('pincode').matches(/^\d{6}$/).withMessage('Invalid pincode'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { address, village, district, state, pincode, latitude, longitude } = req.body;

      const profile = await FarmerProfile.findOneAndUpdate(
        { user: req.user.id },
        {
          location: {
            address,
            village,
            district,
            state,
            pincode,
            coordinates: {
              type:        'Point',
              coordinates: [longitude, latitude],   // GeoJSON: [lng, lat]
            },
          },
        },
        { new: true }
      );

      if (!profile) throw new AppError('Please complete Step 1 first', 400);

      res.json({ success: true, message: 'Farm location saved.', data: profile.location });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/farmer/onboarding/step3 — declare crop types ───────────────────
router.post(
  '/step3',
  verifyToken,
  requireRole('farmer'),
  [
    body('cropTypes').isArray({ min: 1 }).withMessage('At least one crop type required'),
    body('cropTypes.*.name').notEmpty().withMessage('Crop name is required'),
    body('cropTypes.*.category').isIn(['vegetables','fruits','grains','dairy','herbs'])
      .withMessage('Invalid category'),
    body('cropTypes.*.isOrganic').optional().isBoolean(),
    body('cropTypes.*.seasonMonths').optional().isArray(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const profile = await FarmerProfile.findOneAndUpdate(
        { user: req.user.id },
        { cropTypes: req.body.cropTypes },
        { new: true }
      );

      if (!profile) throw new AppError('Please complete Step 1 first', 400);

      res.json({ success: true, message: 'Crop types saved.', data: profile.cropTypes });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/farmer/onboarding/bank — add bank account for payouts ───────────
router.post(
  '/bank',
  verifyToken,
  requireRole('farmer'),
  [
    body('accountHolder').notEmpty().withMessage('Account holder name is required'),
    body('accountNumber').matches(/^\d{9,18}$/).withMessage('Invalid account number'),
    body('ifscCode').matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code'),
    body('bankName').notEmpty().withMessage('Bank name is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { accountHolder, accountNumber, ifscCode, bankName } = req.body;
      const maskedAccount = `****${accountNumber.slice(-4)}`;

      // TODO: Create Razorpay Fund Account for payouts:
      // const razorpay = new Razorpay({ key_id, key_secret });
      // const contact = await razorpay.contacts.create({ name: accountHolder, type: 'vendor' });
      // const fundAccount = await razorpay.fundAccount.create({ ... });

      const profile = await FarmerProfile.findOneAndUpdate(
        { user: req.user.id },
        {
          bankAccount: {
            accountHolder,
            accountNumber,      // encrypt this in production with AES-256
            maskedAccount,
            ifscCode,
            bankName,
          },
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Bank account saved.',
        data: { maskedAccount, ifscCode, bankName },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;