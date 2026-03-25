const notifRouter = require("express").Router();
const { Notification } = require("../models");
const { protect: authN } = require("../middleware/auth");
 
notifRouter.get("/", authN, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
notifRouter.patch("/mark-all-read", authN, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.notifRouter = notifRouter;
