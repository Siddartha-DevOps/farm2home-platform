// DeliveryTracking.js
// Real-time delivery tracking — Swiggy / Zomato style
const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
  status:      String,          // e.g. "Order confirmed", "Out for delivery"
  description: String,
  location:    String,
  timestamp:   { type: Date, default: Date.now },
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

const deliveryTrackingSchema = new mongoose.Schema(
  {
    order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    buyer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ── Delivery partner ──────────────────────────────────────────────────────
    deliveryPartner: {
      name:   String,
      phone:  String,
      avatar: String,
      vehicleNumber: String,
    },

    // ── Live location (updated by delivery app) ───────────────────────────────
    currentLocation: {
      lat:       Number,
      lng:       Number,
      updatedAt: Date,
    },

    // ── Addresses ─────────────────────────────────────────────────────────────
    pickupAddress:   String,    // farm address
    deliveryAddress: String,    // buyer address

    // ── Estimated times ───────────────────────────────────────────────────────
    estimatedPickupTime:   Date,
    estimatedDeliveryTime: Date,
    actualDeliveryTime:    Date,

    // ── Status stages ─────────────────────────────────────────────────────────
    currentStatus: {
      type: String,
      enum: [
        'order_placed',
        'farmer_confirmed',
        'being_packed',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'delivery_failed',
      ],
      default: 'order_placed',
      index: true,
    },

    // ── Timeline (append-only log) ────────────────────────────────────────────
    timeline: [trackingEventSchema],

    // OTP for delivery confirmation
    deliveryOtp:       String,
    otpVerified:       { type: Boolean, default: false },

    // Buyer rating for delivery
    deliveryRating:    { type: Number, min: 1, max: 5 },
    deliveryFeedback:  String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);