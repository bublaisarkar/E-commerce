import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PayPalButton from "./PayPalButton";
import { useDispatch, useSelector } from "react-redux";
// ✅ CRITICAL FIX: Import axios
import axios from "axios"; 
// Assuming you will update checkoutSlice to store the checkout details and ID
import { createCheckout } from "../../redux/slices/checkoutSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Assuming the checkout slice now stores the ID and the current checkout order
  const { cart, loading: cartLoading, error: cartError } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  // 💡 Improvement: Read checkoutId from Redux state (assuming checkoutSlice stores it)
  // For now, keeping local state, but acknowledging it should be in Redux for persistence.
  const [checkoutId, setCheckoutId] = useState(null); 
  
  // Local state for shipping details
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || "", // Pre-fill if available
    lastName: user?.lastName || "",   // Pre-fill if available
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // --- 1. Cart Validation and Redirection ---
  useEffect(() => {
    // Redirect if cart is empty. Check only after cart loading is done.
    if (!cartLoading && (!cart || !cart.products || cart.products.length === 0)) {
      navigate("/");
    }
  }, [cart, navigate, cartLoading]);

  // --- 2. Create Checkout Order ---
  const handleCreateCheckout = async (e) => {
    e.preventDefault();

    if (cart && cart.products.length > 0) {
      try {
        // Dispatch the thunk and use .unwrap() for promise handling
        const res = await dispatch(
          createCheckout({
            checkoutItems: cart.products,
            shippingAddress,
            paymentMethod: "Paypal", // Default payment method
            totalPrice: cart.totalPrice,
          })
        ).unwrap(); // Use unwrap to handle rejection errors
        
        // Assuming the thunk returns the checkout object
        if (res && res._id) {
          setCheckoutId(res._id); // Set checkout ID if checkout was successful
        }
      } catch (error) {
        console.error("Failed to create checkout:", error);
        alert(`Failed to create order: ${error.message || "Please check your network."}`);
      }
    }
  };

  // --- 3. Handle Successful Payment ---
  const handlePaymentSuccess = async (details) => {
    try {
      // ⚠️ Note: Accessing token directly from localStorage is okay here, but ensure the user is authenticated.
      const token = localStorage.getItem("userToken");

      // Update payment status on the backend
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        { paymentStatus: "paid", paymentDetails: details },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Finalize checkout after payment success
      await handleFinalizeCheckout(checkoutId, token); 

    } catch (error) {
      console.error("Payment success handling failed:", error);
      alert("Payment verified, but final order placement failed. Please contact support.");
    }
  };

  // --- 4. Finalize Checkout ---
  const handleFinalizeCheckout = async (id, token) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${id}/finalize`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Success: Navigate to confirmation page
      navigate("/order-confirmation");

    } catch (error) {
      console.error("Finalize checkout failed:", error);
      alert("Order finalization failed. Please contact support.");
    }
  };

  if (cartLoading) return <p className="text-center py-20">Loading cart ...</p>;
  if (cartError) return <p className="text-center py-20 text-red-600">Error loading cart: {cartError}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p className="text-center py-20">Your cart is empty. Redirecting...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto py-12 px-6">
      {/* Left Section: Shipping and Payment Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold uppercase mb-8"> Checkout</h2>
        
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2"> 1. Contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              // 💡 Improvement: Use optional chaining for clean disabled value
              value={user?.email || ""} 
              className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>

          <h3 className="text-xl font-semibold mb-4 border-b pb-2 mt-8"> 2. Delivery Address</h3>
          {/* Shipping Form Inputs */}
          <div className="mb-4 grid grid-cols-2 gap-4">
             {/* ... (First Name, Last Name, Address, City, Postal Code, Country, Phone) ... */}
             {Object.keys(shippingAddress).map(key => {
                 const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'); // Format key to readable label
                 return (
                    <div key={key} className={key === 'address' || key === 'country' || key === 'phone' ? 'col-span-2' : 'col-span-1'}>
                        <label className="block text-gray-700 font-medium">{label}</label>
                        <input
                            type={key === 'phone' ? 'tel' : 'text'}
                            value={shippingAddress[key]}
                            onChange={(e) =>
                                setShippingAddress({
                                    ...shippingAddress,
                                    [key]: e.target.value,
                                })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
                            required
                        />
                    </div>
                 )
             })}
          </div>
          
          <div className="mt-10">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow-md"
              >
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2"> 3. Payment</h3>
                <p className="mb-4 text-gray-600">Order successfully created. Proceed to payment.</p>
                
                <div className="max-w-xs mx-auto">
                    <PayPalButton
                    amount={cart.totalPrice}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => console.error("PayPal Error:", err) || alert("Payment failed. Try again. ")}
                    />
                </div>
                
              </div>
            )}
          </div>
        </form>
      </div>
      
      {/* Right Section: Order Summary */}
      <div className="bg-gray-50 p-8 rounded-xl h-fit shadow-lg">
        <h3 className="text-2xl font-bold mb-6"> Your Order Summary</h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {cart.products.map((product, index) => (
            <div key={index} className="flex items-start justify-between py-3 border-b border-gray-200">
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-20 object-cover mr-4 rounded-md"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                  <p className="text-sm text-gray-500">
                    Size: {product.size} / Color: {product.color}
                  </p>
                </div>
              </div>
              <p className="text-lg font-semibold"> ${product.price * product.quantity}</p>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-300 mt-6 pt-4 space-y-2">
          <div className="flex justify-between items-center text-md">
            <p>Subtotal ({cart.products.length} items)</p>
            <p className="font-medium">${cart.totalPrice?.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center text-md">
            <p>Shipping</p>
            <p className="font-medium text-green-600">Free</p>
          </div>
          <div className="flex justify-between items-center text-xl mt-4 border-t pt-4 font-bold">
            <p>Order Total</p>
            <p>${cart.totalPrice?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;