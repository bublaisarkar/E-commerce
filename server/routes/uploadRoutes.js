const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

require("dotenv").config();

// Assuming you have imported and configured middleware like 'protect' and 'admin'
// const { protect, admin } = require("../middleware/authMiddleware"); 

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup using memory storage with security limits
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit 
    }, 
    fileFilter: (req, file, cb) => {
        // Only allow image mimetypes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            // Reject non-image files gracefully
            cb(null, false);
            req.fileValidationError = 'Only image files are allowed.';
        }
    }
});

// @route POST/
// @desc Upload a single image to Cloudinary
// @access Private/Admin (Recommended)
// Added 'protect' and 'admin' middleware as a placeholder for security
// router.post("/", protect, admin, upload.single("image"), async (req, res) => { 
router.post("/", upload.single("image"), async (req, res) => { // Using original access for review
  try {
    // Handle Multer file filter rejection
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file Uploaded" });
    }

    // Function to handle the stream upload to Cloudinary
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "ecommerce_assets" }, // Added folder organization
            (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        // Use streamifier to convert file buffer to a stream
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    // Call the streamUpload function
    const result = await streamUpload(req.file.buffer);

    // Respond with the uploaded image URL and public ID
    res.json({ 
        imageUrl: result.secure_url,
        publicId: result.public_id // Recommended to save publicId for deletion/management
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "File upload failed", error: error.message || "Unknown error" });
  }
});

module.exports = router;