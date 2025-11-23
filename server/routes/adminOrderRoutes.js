const express = require("express");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET/api/admin/orders
// @desc Get all order (Admin only)
// @access Private/Admin

router.get("/", protect, admin, async (req, res) => {
  try {
    // Populate the user's name and email for the admin view
    const orders = await Order.find({}).populate("user", "name email");
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------------------------------------------------------------

// @route PUT/api/admin/orders/:id
// @desc Update order status
//@access Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name");
    if (order) {
      order.status = req.body.status || order.status;
      
      // Update isDelivered based on the status string
      order.isDelivered =
        req.body.status === "Delivered" ? true : order.isDelivered;
      
      // FIX: Use strict comparison (===) to check status before setting deliveredAt
      order.deliveredAt = req.body.status === "Delivered" // CRITICAL FIX APPLIED
        ? Date.now()
        : order.deliveredAt;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------------------------------------------------------------

// @route DELETE /api/admin/orders/:id
//@desc Delete an order
// @access Private/Admin

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    // Removed unnecessary .populate() call
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: "Order removed" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;