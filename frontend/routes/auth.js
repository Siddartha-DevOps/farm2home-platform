const authRouter = require("express").Router();
const { User, Farmer, Notification } = require("../models");
const { generateAccessToken, generateRefreshToken, protect } = require("../middleware/auth");
const crypto = require("crypto");
 
// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
 
    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });
 
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(409).json({ success: false, message: "Email or phone already registered" });
 
    const user = await User.create({ name, email, phone, password, role: role || "customer" });
 
    // If registering as farmer, create farmer profile
    if (role === "farmer") {
      await Farmer.create({
        user: user._id,
        farmName: `${name}'s Farm`,
        location: { city: "Unknown", state: "Unknown" },
      });
    }
 
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
 
    // Welcome notification
    await Notification.create({
      user: user._id, type: "system",
      title: "Welcome to Farm2Home! 🌿",
      message: "Thank you for joining. Explore fresh produce from verified farmers.",
      icon: "🎉"
    });
 
    res.status(201).json({
      success: true, message: "Registered successfully",
      accessToken, refreshToken,
      user: user.toPublicJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });
 
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });
 
    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
 
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
 
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
 
    res.json({
      success: true, message: "Login successful",
      accessToken, refreshToken,
      user: user.toPublicJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// POST /api/auth/send-otp
authRouter.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
 
    // In production: send via Twilio / MSG91
    console.log(`📱 OTP for ${phone}: ${otp}`);
 
    await User.findOneAndUpdate({ phone }, { otp, otpExpiry }, { upsert: false });
 
    res.json({ success: true, message: "OTP sent", ...(process.env.NODE_ENV === "development" && { otp }) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// GET /api/auth/me
authRouter.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});
 
// POST /api/auth/refresh
authRouter.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token required" });
 
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || "refresh_secret");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "Invalid token" });
 
    const newAccessToken = generateAccessToken(user._id, user.role);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (_) {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
});
 
// PATCH /api/auth/change-password
authRouter.patch("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
 
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.authRouter = authRouter
