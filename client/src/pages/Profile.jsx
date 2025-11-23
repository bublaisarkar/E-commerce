import { useEffect } from "react";
import MyOrdersPage from "./MyOrdersPage";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";

const Profile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Authentication Check ---
  useEffect(() => {
    // Navigate to login if user is null (not authenticated)
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // --- Logout Handler ---
  const handleLogout = () => {
    // Clear user state and local storage
    dispatch(logout());
    // Clear cart state (in case any data persisted locally)
    dispatch(clearCart());
    // Navigate user to the login page
    navigate("/login");
  };

  // --- Loading/Error State ---
  // If user data is still being checked or if redirection hasn't occurred yet, show loading.
  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-medium">Loading profile...</p>
      </div>
    );
  }

  // --- Main Render (Only if user exists) ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Added light background */}
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800">My Account</h1>
        
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          
          {/* Left Section: User Info and Actions */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-xl rounded-xl p-8 h-fit">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{user.name}</h2>
            <p className="text-md text-gray-600 mb-6">{user.email}</p>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition duration-200 shadow-md"
            >
              Logout
            </button>
            {/* Optional: Add Admin link here if user.role === "admin" */}
            {user.role === "admin" && (
              <Link 
                to="/admin" 
                className="mt-4 block text-center w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
              >
                Go to Admin Dashboard
              </Link>
            )}
          </div>
          
          {/* Right Section: Orders table */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">My Orders</h2>
            <MyOrdersPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;