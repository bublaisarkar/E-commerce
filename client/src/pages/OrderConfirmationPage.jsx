import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; 
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice"; 
// import { clearCheckout } from "../redux/slices/checkoutSlice"; // Not needed here

const OrderConfirmationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Select the whole checkout object
    const { checkout } = useSelector((state) => state.checkout); 
    
    // 🎯 CRITICAL FIX: Extract the stable ID outside the hook
    const checkoutId = checkout?._id; 

    // --- Order Cleanup (Run only ONCE when data is first present) ---
    useEffect(() => {
        // Check if the stable order ID exists
        if (checkoutId) {
            // 1. Clear the cart state (Redux)
            dispatch(clearCart());
            // 2. Clear the cart data from local storage
            localStorage.removeItem("cart");
            
            // Note: We intentionally avoid dispatching clearCheckout() here 
            // to keep the order data visible on the page.
        }
        // Dependency is the stable checkoutId string and dispatch (stable)
        // This prevents infinite loops and unwanted reruns.
    }, [dispatch, checkoutId]); 

    // --- Utility for Estimated Delivery ---
    const calculateEstimatedDelivery = (createdAt) => {
        const orderDate = new Date(createdAt);
        // Delivery is 10 days from order date
        orderDate.setDate(orderDate.getDate() + 10); 
        return orderDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // --- Conditional Render: Wait for Data ---
    if (!checkout) {
        return (
            <div className="text-center py-20 text-lg">
                Order details not found.
                <button 
                    onClick={() => navigate("/my-orders")}
                    className="mt-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition block mx-auto"
                >
                    Go to My Orders
                </button>
            </div>
        );
    }

    // --- Confirmation Display ---
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg my-12">
            <h1 className="text-4xl font-extrabold text-center text-green-600 mb-10">
                Thank You for Your Order!
            </h1>
            
            <div className="p-8 rounded-xl border border-gray-200">
                
                {/* Order ID and Estimated Delivery */}
                <div className="flex flex-col md:flex-row justify-between mb-10 border-b pb-6">
                    <div>
                        <h2 className="text-xl font-bold mb-1">
                            Order ID: <span className="text-gray-700">{checkout._id}</span>
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Order Date: {new Date(checkout.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="md:text-right mt-4 md:mt-0">
                        <p className="text-green-700 font-bold text-lg">
                            Estimated Delivery
                        </p>
                        <p className="text-gray-600">
                            {calculateEstimatedDelivery(checkout.createdAt)}
                        </p>
                    </div>
                </div>
                
                {/* Order Items List */}
                <div className="mb-10 space-y-4">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Items Ordered</h3>
                    {checkout.checkoutItems.map((item) => (
                        <div key={item.productId} className="flex items-start justify-between border-b pb-4">
                            <div className="flex items-start">
                                <img
                                    src={item.image || "/images/placeholder.jpg"} 
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-md mr-4 border"
                                />
                                <div>
                                    <h4 className="text-lg font-semibold">{item.name}</h4>
                                    <p className="text-sm text-gray-500">
                                        {item.color} / {item.size}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Payment, Shipping, and Total */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-6">
                    
                    {/* 1. Payment Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-2 text-gray-800">Payment Method</h4>
                        <p className="text-gray-600"> {checkout.paymentMethod || "PayPal"}</p>
                    </div>
                    
                    {/* 2. Delivery Address */}
                    <div>
                        <h4 className="text-lg font-bold mb-2 text-gray-800">Shipping Address</h4>
                        <p className="text-gray-600">
                            {checkout.shippingAddress.firstName} {checkout.shippingAddress.lastName}
                        </p>
                        <p className="text-gray-600">
                            {checkout.shippingAddress.address}, {checkout.shippingAddress.city}
                        </p>
                        <p className="text-gray-600">
                            {checkout.shippingAddress.postalCode}, {checkout.shippingAddress.country}
                        </p>
                    </div>
                    
                    {/* 3. Total Price */}
                    <div className="md:text-right">
                        <h4 className="text-lg font-bold mb-2 text-gray-800">Order Total</h4>
                        <p className="text-3xl font-extrabold text-green-700">
                            ${checkout.totalPrice?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">Shipping: FREE</p>
                        <button 
                            onClick={() => navigate("/my-orders")}
                            className="mt-4 bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition"
                        >
                            View All Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;