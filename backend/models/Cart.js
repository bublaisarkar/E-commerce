const mongoose = require("mongoose");

// Corrected sub-schema name and added necessary 'required' fields
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, // CRITICAL FIX: Changed to Number for math
        required: true 
    },
    size: String,
    color: String,
    quantity: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // If user is logged in, this will be present; otherwise, guestId will be used.
    // We keep it optional here.
    required: false, 
  },
  guestId: {
    type: String,
  },
  products: [cartItemSchema], // FIXED TYPO: Changed Products to lowercase 'products'
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
},
{ timestamps: true}
);

module.exports = mongoose.model("Cart", cartSchema)