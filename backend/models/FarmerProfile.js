// FarmerProfile.js
const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // ── Aadhaar Verification ──────────────────────────────────────────────────
    aadhaar: {
      number:       { type: String, select: false },      // masked, never returned in API
      maskedNumber: { type: String },                     // e.g. XXXX-XXXX-1234
      verified:     { type: Boolean, default: false },
      verifiedAt:   Date,
      name:         String,                               // name as on Aadhaar
    },

    // ── Farm Details ──────────────────────────────────────────────────────────
    farmName:    { type: String, required: true },
    farmSizeCre: Number,                                  // size in acres
    bio:         String,

    // ── Farm Location ─────────────────────────────────────────────────────────
    location: {
      address:  String,
      village:  String,
      district: String,
      state:    String,
      pincode:  String,
      coordinates: {
        type:        { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },  // [longitude, latitude]
      },
    },

    // ── Crop Types ────────────────────────────────────────────────────────────
    cropTypes: [
      {
        name:          String,               // e.g. "Mango", "Tomato"
        category:      String,               // vegetables, fruits, grains, dairy, herbs
        isOrganic:     { type: Boolean, default: false },
        seasonMonths:  [Number],             // e.g. [3, 4, 5] = March-May
        certifications: [String],            // e.g. ["NPOP Organic", "GlobalG.A.P"]
      },
    ],

    // ── Verification status ───────────────────────────────────────────────────
    verificationStatus: {
      type:    String,
      enum:    ['pending', 'documents_submitted', 'under_review', 'approved', 'rejected'],
      default: 'pending',
      index:   true,
    },
    verificationNote:   String,             // admin note on rejection
    verifiedByAdmin:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ── Bank account for payouts ──────────────────────────────────────────────
    bankAccount: {
      accountHolder: String,
      accountNumber: { type: String, select: false },
      maskedAccount: String,                // e.g. ****6789
      ifscCode:      String,
      bankName:      String,
      razorpayFundAccountId: { type: String, select: false },
    },

    // ── Stats (denormalized for dashboard speed) ──────────────────────────────
    stats: {
      totalOrders:    { type: Number, default: 0 },
      totalRevenue:   { type: Number, default: 0 },
      avgRating:      { type: Number, default: 0 },
      reviewCount:    { type: Number, default: 0 },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geo index for farm location searches
farmerProfileSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);