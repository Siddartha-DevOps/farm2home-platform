const uploadRouter = require("express").Router();
const multer = require("multer");
const { protect: authU } = require("../middleware/auth");
 
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  }
});
 
uploadRouter.post("/image", authU, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
 
    // In production: upload to Cloudinary or AWS S3
    // const cloudinary = require("cloudinary").v2;
    // const result = await cloudinary.uploader.upload_stream(...)
    // For now, return a placeholder
    const imageUrl = `https://farm2home-assets.s3.amazonaws.com/products/${Date.now()}-${req.file.originalname}`;
    res.json({ success: true, url: imageUrl, message: "Image uploaded (configure Cloudinary/S3 in production)" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
module.exports.uploadRouter = uploadRouter;
