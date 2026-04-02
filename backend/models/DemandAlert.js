// DemandAlert.js
// Admins or buyers post demand alerts; farmers in the relevant area get notified
const mongoose = require('mongoose');

const demandAlertSchema = new mongoose.Schema(
  {
    // Who posted the demand
    postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerType:   { type: String, enum: ['household', 'retailer', 'hotel', 'wholesaler'], required: true },
    buyerName:   String,                                // e.g. "Taj Hotel Hyderabad"

    // What they need
    cropName:    { type: String, required: true },      // e.g. "Mango"
    category:    String,                                // vegetables, fruits, etc.
    quantityKg:  { type: Number, required: true },
    unit:        { type: String, default: 'kg' },
    offerPrice:  { type: Number, required: true },      // ₹ per unit
    isOrganic:   { type: Boolean, default: false },
    neededBy:    { type: Date, required: true },        // delivery deadline

    // Location / geo target
    deliveryCity:    String,
    deliveryState:   String,
    deliveryPincode: String,
    radiusKm:        { type: Number, default: 100 },    // notify farmers within this radius

    // Status
    status: {
      type:    String,
      enum:    ['open', 'partially_filled', 'fulfilled', 'expired', 'cancelled'],
      default: 'open',
      index:   true,
    },

    // Farmer responses
    responses: [
      {
        farmer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        offeredPrice:  Number,
        offeredQtyKg:  Number,
        message:       String,
        status:        { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        respondedAt:   { type: Date, default: Date.now },
      },
    ],

    expiresAt: { type: Date, index: true },
    views:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

demandAlertSchema.index({ status: 1, neededBy: 1 });
demandAlertSchema.index({ cropName: 1, status: 1 });

module.exports = mongoose.model('DemandAlert', demandAlertSchema);