const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  register,
  login,
  getProfile,
  getUserById,
  updateProfile,
  updateFarmerDetails,
  changePassword,
  getAllFarmers,
  getFarmerProfile,
  deleteUser
} = require("../controllers/userController");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/:id", getUserById);
router.get("/farmers/list", getAllFarmers);
router.get("/farmers/:id", getFarmerProfile);

// Protected routes (require authentication)
router.get("/", auth, getProfile);
router.put("/", auth, updateProfile);
router.put("/farmer-details", auth, updateFarmerDetails);
router.put("/change-password", auth, changePassword);
router.delete("/", auth, deleteUser);

module.exports = router;
