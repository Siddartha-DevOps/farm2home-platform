/**
 * Farm2Home — All Mongoose Models
 * File: models/index.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── USER MODEL ───────────────────────────────────────────────────────────────
const addressSchema = new mongoose.Schema({
  label:    { type: String, default: "Home" },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  isDefault:{ type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  phone:       { type: String, required: true, unique: true },
  password:    { type: String, required: true, minlength: 6, select: false },
  role:        { type: String, enum: ["customer", "farmer", "admin"], default: "customer" },
  avatar:      { type: String, default: "" },
  addresses:   [addressSchema],
  wishlist:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  isActive:    { type: Boolean, default: true },
  isVerified:  { type: Boolean, default: false },
  otp:         { type: String, select: false },
  otpExpiry:   { type: Date, select: false },
  lastLogin:   Date,
  fcmToken:    String, // for push notifications
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

const User = mongoose.model("User", userSchema);

// ─── FARMER PROFILE MODEL ─────────────────────────────────────────────────────
const farmerSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  farmName:      { type: String, required: true },
  description:   String,
  location: {
    address:     String,
    city:        { type: String, required: true },
    state:       { type: String, required: true },
    pincode:     String,
    coordinates: { lat: Number, lng: Number },
  },
  certifications:[String], // "Organic", "GAP", "ISO"
  bankDetails: {
    accountNo:   { type: String, select: false },
    ifsc:        { type: String, select: false },
    bankName:    String,
    accountName: String,
  },
  isVerified:    { type: Boolean, default: false },
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:  { type: Number, default: 0 },
  totalRevenue:  { type: Number, default: 0 },
  totalOrders:   { type: Number, default: 0 },
  coverImage:    String,
  images:        [String],
}, { timestamps: true });

const Farmer = mongoose.model("Farmer", farmerSchema);

// ─── PRODUCT MODEL ────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true, index: true },
  description:  { type: String, required: true },
  farmer:       { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
  category: {
    type: String,
    enum: ["Vegetables", "Fruits", "Leafy Greens", "Herbs", "Grains", "Dairy", "Spices", "Other"],
    required: true,
  },
  price:        { type: Number, required: true, min: 0 },
  unit:         { type: String, required: true }, // "kg", "dozen", "bunch", "piece"
  discount:     { type: Number, default: 0, min: 0, max: 100 },
  stock:        { type: Number, required: true, min: 0 },
  images:       [String],
  isOrganic:    { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  isFeatured:   { type: Boolean, default: false },
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  deliveryDays: { type: Number, default: 1 },
  nutritionInfo:{ calories: Number, protein: Number, carbs: Number, fat: Number },
  tags:         [String],
}, { timestamps: true });

// Text search index
productSchema.index({ name: "text", description: "text", tags: "text" });

const Product = mongoose.model("Product", productSchema);

// ─── ORDER MODEL ──────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  farmer:    { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
  name:      String,
  image:     String,
  price:     { type: Number, required: true },
  discount:  { type: Number, default: 0 },
  quantity:  { type: Number, required: true, min: 1 },
  unit:      String,
  subtotal:  { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderId:     { type: String, unique: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items:       [orderItemSchema],
  deliveryAddress: {
    name:      String,
    phone:     String,
    street:    String,
    city:      String,
    state:     String,
    pincode:   String,
  },
  payment: {
    method:    { type: String, enum: ["upi", "card", "netbanking", "cod", "wallet"], required: true },
    status:    { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    razorpayOrderId:    String,
    razorpayPaymentId:  String,
    razorpaySignature:  String,
    paidAt:    Date,
  },
  status: {
    type: String,
    enum: ["ordered", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"],
    default: "ordered",
  },
  statusHistory: [{
    status:    String,
    updatedAt: { type: Date, default: Date.now },
    note:      String,
  }],
  subtotal:    { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  total:       { type: Number, required: true },
  deliveryDate:Date,
  notes:       String,
}, { timestamps: true });

orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

// ─── CART MODEL ───────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addedAt:  { type: Date, default: Date.now },
  }],
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

cartSchema.methods.getTotal = async function () {
  await this.populate("items.product");
  return this.items.reduce((sum, item) => {
    const price = item.product.price * (1 - item.product.discount / 100);
    return sum + price * item.quantity;
  }, 0);
};

const Cart = mongoose.model("Cart", cartSchema);

// ─── REVIEW MODEL ─────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order:    { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  title:    String,
  comment:  String,
  images:   [String],
  isVerifiedPurchase: { type: Boolean, default: true },
  helpful:  { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

// ─── NOTIFICATION MODEL ───────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:     { type: String, enum: ["order_update", "payment", "promo", "system", "review"], required: true },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  data:     mongoose.Schema.Types.Mixed,
  isRead:   { type: Boolean, default: false },
  icon:     String,
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

// ─── COUPON MODEL ─────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true },
  description:   String,
  type:          { type: String, enum: ["percentage", "flat"], required: true },
  value:         { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   Number,
  usageLimit:    Number,
  usedCount:     { type: Number, default: 0 },
  userUsageLimit:{ type: Number, default: 1 },
  validFrom:     { type: Date, required: true },
  validTill:     { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
  applicableOn:  { type: String, enum: ["all", "category", "product", "farmer"], default: "all" },
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = { User, Farmer, Product, Order, Cart, Review, Notification, Coupon };
