const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// @route POST/api/users/register
// @desc Register a new user
// @access Public
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check for existing user
    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ message: "User already exists" });
    }

    // 2. Create new user (password hashing should happen in the User model pre-save hook)
    user = new User({ name, email, password });
    await user.save();

    // 3. Generate JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // 4. Sign and return the token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Token generation failed" });
        }
        res
          .status(201)
          .json({
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            token,
          });
      }
    );
  } catch (error) {
    console.error(error);
    // IMPROVEMENT: Standardized JSON error response
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/users/login
// @desc Authenticate user 
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    
    // 2. Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });
    
    // 3. Generate JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // 4. Sign and return the token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Token generation failed" });
        }
        // Return token and user data (excluding password)
        res.json({
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            token,
          });
      }
    );

  } catch (error) {
    console.error(error);
    // IMPROVEMENT: Standardized JSON error response
    res.status(500).json({ message: "Server Error" });
  }

});

// @route GET /api/users/profile
// @desc Get user profile 
// @access Private
router.get("/profile", protect, async (req, res) => {
    // req.user is populated by the 'protect' middleware after verification
    
    // SECURITY CHECK: Ensure password hash is NOT returned even if populated by middleware
    const userProfile = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    };
    
    res.json(userProfile);
});

module.exports = router;