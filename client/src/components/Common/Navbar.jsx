import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import SearchBar from "./SearchBar.jsx";
import CartDrawer from "../Layout/CartDrawer.jsx";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false); // Cart Drawer State
  const [navDrawerOpen, setNavDrawerOpen] = useState(false); // Mobile Nav Drawer State
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Base classes for the icon links
  const iconClass = "h-6 w-6 transition-colors duration-200";

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* left-logo */}
        <div>
          <Link to="/" className="text-2xl font-medium">
            Rabbit
          </Link>
        </div>
        
        {/* Center - Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/collections/all?gender=Men"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase transition-colors"
          >
            Men
          </Link>
          <Link
            to="/collections/all?gender=Women"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase transition-colors"
          >
            Women
          </Link>
          <Link
            to="/collections/all?category=Top Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase transition-colors"
          >
            Top Wear
          </Link>
          <Link
            to="/collections/all?category=Bottom Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase transition-colors"
          >
            Bottom Wear
          </Link>
        </div>
        
        {/* Right - Icons */}
        <div className="flex items-center space-x-4">
          {/* Admin Link */}
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-black px-2 py-0.5 rounded text-sm text-white hover:bg-gray-800 transition-colors"
            >
              Admin
            </Link>
          )}

          {/* Profile Link */}
          <Link 
            to={user ? "/profile" : "/login"} // Assume non-user goes to login
            className="text-gray-700 hover:text-black" // ✅ FIX: Corrected typo Ohover:text-black
          >
            <HiOutlineUser className={iconClass} />
          </Link>
          
          {/* Cart Button */}
          <button
            onClick={toggleCartDrawer}
            className="relative text-gray-700 hover:text-black"
          >
            <HiOutlineShoppingBag className={iconClass} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
          
          {/* Search */}
          <div className="overflow-hidden">
            <SearchBar />
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={toggleNavDrawer} className="md:hidden text-gray-700 hover:text-black">
            <HiBars3BottomRight className={iconClass} />
          </button>
        </div>
      </nav>
      
      {/* Cart Drawer Component */}
      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

      {/* --- Mobile Navigation Drawer and Overlay --- */}
      
      {/* 1. Backdrop Overlay */}
      {navDrawerOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
          onClick={toggleNavDrawer}
        ></div>
      )}

      {/* 2. Mobile Navigation Panel */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 max-w-xs h-full bg-white shadow-2xl transform
        transition-transform duration-300 z-50 ${
          navDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={toggleNavDrawer} className="hover:text-black">
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
          <nav className="space-y-4">
            <Link
              to="/collections/all?gender=Men"
              onClick={toggleNavDrawer}
              className="block text-gray-800 hover:text-black text-lg font-medium border-b pb-1"
            >
              Men
            </Link>
            <Link
              to="/collections/all?gender=Women"
              onClick={toggleNavDrawer}
              className="block text-gray-800 hover:text-black text-lg font-medium border-b pb-1"
            >
              Women
            </Link>
            <Link
              to="/collections/all?category=Top Wear"
              onClick={toggleNavDrawer}
              className="block text-gray-800 hover:text-black text-lg font-medium border-b pb-1"
            >
              Top Wear
            </Link>
            <Link
              to="/collections/all?category=Bottom Wear"
              onClick={toggleNavDrawer}
              className="block text-gray-800 hover:text-black text-lg font-medium border-b pb-1"
            >
              Bottom Wear
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;