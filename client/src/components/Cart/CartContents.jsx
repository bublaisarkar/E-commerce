import React from "react";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { updateCartItemQuantity, removeFromCart } from "../../redux/slices/cartSlice";

const CartContents = ({ cart, userId, guestId }) => {
  const dispatch = useDispatch();

  // Handle adding or subtracting quantity
  const handleAddToCart = (productId, delta, quantity, size, color) => {
    const newQuantity = quantity + delta;
    
    // updateCartItemQuantity should handle quantity updates, including removal if newQuantity is 0
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          guestId,
          userId,
          size,
          color,
        })
      );
    } 
    // If the user tries to go below 1, we can optionally remove the item or just stop. 
    // The current logic handles this by stopping at 1 (newQuantity >= 1 check in original code).
  };

  const handleRemoveFromCart = (productId, size, color) => {
    dispatch(removeFromCart({ productId, guestId, userId, size, color }));
  };

  // Ensure cart.products is an array before mapping
  if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
      return <p className="text-center text-gray-500 p-8">Your cart is empty.</p>;
  }

  return (
    <div>
      {cart.products.map((product) => (
        <div
          // ⚠️ Improvement: Create a unique key using product variant data
          key={`${product.productId}-${product.size}-${product.color}`} 
          className="flex items-start justify-between py-4 border-b"
        >
          <div className="flex items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-24 object-cover mr-4 rounded"
            />
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                size: {product.size} | color: {product.color}
              </p>
              
              {/* Quantity Controls */}
              <div className="flex items-center mt-2">
                {/* MINUS Button */}
                <button
                  onClick={() =>
                    handleAddToCart(
                      product.productId,
                      -1, // Correct delta for decrement
                      product.quantity,
                      product.size,
                      product.color
                    )
                  }
                  // Disable if quantity is 1
                  disabled={product.quantity <= 1} 
                  className="border rounded px-2 py-1 text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="mx-4 font-medium">{product.quantity}</span>
                
                {/* PLUS Button */}
                <button
                  onClick={() =>
                    handleAddToCart(
                      product.productId,
                      +1, // ✅ FIX: Correct delta for increment
                      product.quantity,
                      product.size,
                      product.color
                    )
                  }
                  className="border rounded px-2 py-1 text-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {/* Price and Delete Button */}
          <div className="flex flex-col items-end">
            <p className="font-semibold text-lg">$ {product.price.toLocaleString()}</p>
            <button 
              onClick={() =>
                handleRemoveFromCart( // ✅ FIX: Call handleRemoveFromCart
                  product.productId,
                  product.size,
                  product.color
                )
              }
              className="mt-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <RiDeleteBin3Line className="h-6 w-6" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;