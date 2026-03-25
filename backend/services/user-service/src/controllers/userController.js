const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: "7d"
  });
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, phone, userType } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      userType: userType || "customer"
    });

    const savedUser = await user.save();
    savedUser.password = undefined;

    const token = generateToken(savedUser._id);

    res.status(201).json({
      message: "User registered successfully",
      user: savedUser,
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.password = undefined;
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID (public endpoint)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't expose sensitive data
    user.password = undefined;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address, profilePicture },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update farmer details
const updateFarmerDetails = async (req, res) => {
  try {
    const { farmName, farmSize, cropsProduced, farmRegistration, farmLocation } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        userType: "farmer",
        farmDetails: {
          farmName,
          farmSize,
          cropsProduced,
          farmRegistration,
          farmLocation
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Farmer details updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all farmers
const getAllFarmers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const farmers = await User.find({ userType: "farmer" })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password");

    const total = await User.countDocuments({ userType: "farmer" });

    res.json({
      farmers,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get farmer profile
const getFarmerProfile = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id).select("-password");

    if (!farmer || farmer.userType !== "farmer") {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.json(farmer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
