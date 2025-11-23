import React from "react";

import {
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt,
  FaStore,
  FaUser,
  FaTachometerAlt, // Added Dashboard icon
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { clearCart } from "../../redux/slices/cartSlice";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition duration-150"
      : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition duration-150";

  return (
    // 1. 📏 FIX: Added fixed positioning, full height, and dark background
    <div className="bg-gray-900 w-64 min-h-screen fixed top-0 left-0 text-white flex flex-col justify-between">
      <div className="p-4">
        {/* Logo and Title */}
        <div className="mb-8 border-b border-gray-700 pb-4">
          <Link to="/admin" className="text-3xl font-extrabold text-indigo-400 block text-center">
            Rabbit
          </Link>
          <h2 className="text-base font-light mt-1 text-center text-gray-400">Admin Panel</h2>
        </div>
        
        <nav className="flex flex-col space-y-2">
            
          {/* 2. 🏠 FIX: Added Dashboard Link */}
          <NavLink
            to="/admin"
            end // Use 'end' to ensure this only matches the exact path /admin
            className={linkClass}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>
            
          <NavLink
            to="/admin/users"
            className={linkClass}
          >
            <FaUser />
            <span>Users</span>
          </NavLink>
            
          <NavLink
            to="/admin/products"
            className={linkClass}
          >
            <FaBoxOpen />
            <span>Products</span>
          </NavLink>
            
          <NavLink
            to="/admin/orders"
            className={linkClass}
          >
            <FaClipboardList />
            <span>Orders</span>
          </NavLink>
            
          <NavLink
            to="/"
            className={linkClass}
          >
            <FaStore />
            <span>Shop</span>
          </NavLink>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-medium transition duration-150"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;