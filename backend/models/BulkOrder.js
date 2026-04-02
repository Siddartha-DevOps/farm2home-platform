// BulkOrder.js
// Hotels, wholesalers, retailers place bulk orders with negotiations
const mongoose = require('mongoose');

const bulkOrderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName:  String,
  quantityKg:   { type: Number, required: true },
  unit:         { type: String, default: 'kg' },
  requestedPrice: Number,       // buyer's offered price
  agreedPrice:    Number,       // final negotiated price
});

const bulkOrderSchema = new mongoose.Schema(
  {
    buyer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerType:  { type: String, enum: ['household', 'retailer', 'hotel', 'wholesaler'], required: true },
    buyerName:  String,         // "Taj Hotel", "Reliance Fresh Begumpet"

    items: [bulkOrderItemSchema],

    totalQuantityKg: Number,
    totalAmount:     Number,
    advanceAmount:   Number,    // deposit paid
    balanceAmount:   Number,

    // Delivery
    deliveryDate:    { type: Date, required: true },
    deliveryAddress: {
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
    },

    // Status flow: draft → submitted → negotiating → confirmed → fulfilled / cancelled
    status: {
      type:    String,
      enum:    ['draft', 'submitted', 'negotiating', 'confirmed', 'in_progress', 'fulfilled', 'cancelled'],
      default: 'draft',
      index:   true,
    },

    // Assigned farmers (admin matches farmers to this bulk order)
    assignedFarmers: [
      {
        farmer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        items:     [bulkOrderItemSchema],
        status:    { type: String, enum: ['pending', 'accepted', 'rejected', 'fulfilled'], default: 'pending' },
        notes:     String,
      },
    ],

    // Negotiation chat log
    negotiations: [
      {
        by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role:      { type: String, enum: ['buyer', 'farmer', 'admin'] },
        message:   String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    paymentStatus: { type: String, enum: ['unpaid', 'advance_paid', 'fully_paid', 'refunded'], default: 'unpaid' },
    specialInstructions: String,
    internalNotes:       String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);