// Subscription.js
// Restaurants / hotels set up recurring orders (daily milk, weekly vegetables)
const mongoose = require('mongoose');

const subscriptionItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,          // snapshot
  quantityKg:  { type: Number, required: true, min: 0.1 },
  unit:        { type: String, default: 'kg' },
  pricePerUnit: Number,         // locked price at subscription time
});

const subscriptionSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    name:  String,              // e.g. "Daily Dairy Pack", "Weekly Vegetable Box"
    items: [subscriptionItemSchema],

    // ── Frequency ─────────────────────────────────────────────────────────────
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      required: true,
    },
    // For weekly: which days — 0=Sun, 1=Mon … 6=Sat
    deliveryDays: [{ type: Number, min: 0, max: 6 }],
    // Preferred delivery time slot
    deliverySlot: { type: String, enum: ['6am-9am', '9am-12pm', '12pm-3pm', '3pm-6pm'], default: '6am-9am' },

    // ── Delivery address ──────────────────────────────────────────────────────
    shippingAddress: {
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['active', 'paused', 'cancelled'],
      default: 'active',
      index:   true,
    },

    startDate: { type: Date, required: true },
    endDate:   Date,            // null = indefinite
    nextDeliveryDate: Date,

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentMethod: { type: String, enum: ['cod', 'auto_debit', 'wallet'], default: 'cod' },
    totalPerCycle: Number,      // computed total per delivery

    // History of generated orders
    generatedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

    pausedUntil: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);