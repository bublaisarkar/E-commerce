import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
// 1. Import the fetchCart thunk from your cart slice
import { fetchCart } from "../../redux/slices/cartSlice"; 

const UserLayout = () => {
  // 2. Get dispatch and select user/guestId from the Redux store
  const dispatch = useDispatch();
  const { user, guestId } = useSelector((state) => state.auth); 
  
  // 3. Implement the logic to conditionally fetch the cart
  useEffect(() => {
    const currentUserId = user?._id;
    
    // Only proceed if we have a way to identify the cart (user or guest ID)
    if (currentUserId || guestId) {
        
      dispatch(fetchCart({ 
        // Pass the user ID if logged in (user will be truthy)
        userId: currentUserId || null, 
        // Pass the guest ID ONLY if the user is NOT logged in (currentUserId will be falsy)
        guestId: !currentUserId ? guestId : null 
      }));
    }
    // The dependencies ensure the cart is fetched whenever the user logs in/out or the guestId is generated/updated
  }, [user, guestId, dispatch]);

  return (
    <>
      {/* Header */}
      <Header />
      {/* Main Content - Renders the child routes (Home, Checkout, etc.) */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default UserLayout;