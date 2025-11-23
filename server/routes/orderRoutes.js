const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/orders/my-orders
// @desc Get logged-in user's orders
// @access Private
router.get("/my-orders", protect, async (req, res) => {
  try {
    // Find orders for the authenticated user
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    }); // sort by most recent orders
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/orders/:id
// @desc Get order details by ID (with ownership check)
// @access Private
router.get("/:id", protect, async (req, res) => {
  try {
    // Populate user to get their ID for the check
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // SECURITY FIX: Ensure the retrieved order belongs to the authenticated user
    // The populated 'user' field is an object, so we use ._id and .toString() for comparison
    if (order.user._id.toString() !== req.user._id.toString()) {
        // Return 403 Forbidden if the user is not the owner of the order
        return res.status(403).json({ message: "Not authorized to view this order" });
    }

    // Return the full order details
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;