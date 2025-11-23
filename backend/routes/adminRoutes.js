const express = require("express");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET/api/admin/users
// @desc Get all users (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    // SECURITY IMPROVEMENT: Explicitly exclude the password field
    const users = await User.find({}).select('-password'); 
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST/api/admin/users
// @desc Add a new user (admin only)
// @access Private/Admin

router.post("/", protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      role: role || "customer",
    });

    await user.save();
    // Exclude password hash from response
    res.status(201).json({ 
        message: "User created successfully", 
        user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        } 
    });
  } catch (error) {
    console.error(error); // CONSISTENCY FIX: Log the error
    res.status(500).json({ message: "Server Error" });
  }
});

//@route PUT/api/admin/users/:id
// @desc Update user info (admin only) Name, email and role
// @access Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) { // Logic FIX: Ensures user exists before attempting to save
      user.name = req.body.name || user.name;
      
      // Basic check for new email duplicate (more robust checks needed for production)
      if (req.body.email && req.body.email !== user.email) {
          const existingUser = await User.findOne({ email: req.body.email });
          if (existingUser) {
              return res.status(400).json({ message: "Email already taken by another user." });
          }
      }
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      
      const updatedUser = await user.save();
      res.json({ message: "User updated successfully", user: updatedUser });
    } else {
        res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route DELETE/api/admin/users/:id
// @desc Delete a user
// @access Private/Admin

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;