import React, { useEffect } from "react";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import CartContents from "../Cart/CartContents";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  // Destructure necessary state from Redux
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const userId = user ? user._id : null;

  // Calculate total price defensively
  const cartTotalPrice =
    cart?.products?.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    ) || 0; // Ensure a fallback value of 0

  // ♿ Accessibility Fix: Close drawer on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && drawerOpen) {
        toggleCartDrawer();
      }
    };

    // Attach event listener only when the drawer is open
    if (drawerOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    // Clean up the event listener on unmount or when drawerOpen changes
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [drawerOpen, toggleCartDrawer]);

  const handleCheckout = () => {
    // Close drawer immediately upon starting checkout process
    toggleCartDrawer();

    // Conditional navigation based on authentication status
    if (!user) {
      // Redirect unauthenticated user to login with a redirect query parameter
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    // Using empty fragment syntax <> instead of <Fragment> for conciseness
    <>
      {/* 1. Backdrop Overlay (Visible when drawerOpen is true) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleCartDrawer} // Close drawer when backdrop is clicked
          aria-hidden="true"
        ></div>
      )}

      {/* 2. Cart Drawer Panel */}
      <div
        className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[30rem] h-full bg-white shadow-2xl transform
                transition-transform duration-300 flex flex-col z-50 ${
                  drawerOpen ? "translate-x-0" : "translate-x-full"
                }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Header and Close button */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold"> Your Cart</h2>
          <button
            onClick={toggleCartDrawer}
            aria-label="Close Cart"
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <IoMdClose className="h-6 w-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* Cart contents with scrollable area */}
        <div className="flex-grow p-4 overflow-y-auto">
          {/* Check if cart and products array exist and has items */}
          {cart && cart?.products?.length > 0 ? (
            // CartContents needs 'cart' and 'userId' (or guestId if used) for actions
            <CartContents cart={cart} userId={userId} />
          ) : (
            <div className="py-10 text-center text-gray-500">
              <HiOutlineShoppingBag className="h-10 w-10 mx-auto mb-4" />
              <p>Your cart is empty.</p>
              <button
                onClick={toggleCartDrawer}
                className="mt-4 text-black underline hover:text-gray-700"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Checkout Button and Footer (Fixed at the bottom of the drawer) */}
        {cart && cart?.products?.length > 0 && (
          <div className="p-4 bg-white border-t">
            {/* Subtotal Display */}
            <div className="flex justify-between font-bold text-lg mb-3">
              <span>Subtotal:</span>
              <span>${cartTotalPrice.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </button>

            {/* Footer Text */}
            <p className="text-xs tracking-tight text-gray-500 mt-2 text-center">
              Shipping, taxes, and discount codes calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
