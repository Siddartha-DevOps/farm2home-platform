/**
 * Farm2Home Platform — Main Express Server
 * Tech: Node.js + Express + MongoDB (Mongoose) + JWT + Socket.io
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ─── Socket.io (Real-time notifications) ──────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", methods: ["GET", "POST"] }
});

// Attach io to app for use in routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("join_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("farmer_join", (farmerId) => {
    socket.join(`farmer_${farmerId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests" });
app.use("/api/", limiter);

// Stricter limiter for auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many auth attempts" });
app.use("/api/auth/", authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",        require("./routes/auth"));
app.use("/api/products",    require("./routes/products"));
app.use("/api/orders",      require("./routes/orders"));
app.use("/api/cart",        require("./routes/cart"));
app.use("/api/farmers",     require("./routes/farmers"));
app.use("/api/payments",    require("./routes/payments"));
app.use("/api/admin",       require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/reviews",     require("./routes/reviews"));
app.use("/api/upload",      require("./routes/upload"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({
  status: "OK", timestamp: new Date(),
  version: "1.0.0", platform: "Farm2Home"
}));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ─── DB + Server Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/farm2home";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(PORT, () => console.log(`🚀 Farm2Home API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = { app, io };
