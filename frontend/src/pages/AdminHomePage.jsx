import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // ⬅️ Added useNavigate for dynamic row click
import { fetchAdminProducts } from "../redux/slices/adminProductSlice";
import { fetchAllOrders } from "../redux/slices/adminOrderSlice";

const AdminHomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ⬅️ Initialize useNavigate

  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.adminProducts);
  
  const {
    orders,
    totalOrders,
    totalSales,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Handler for clicking a table row to view details
  const handleOrderClick = (orderId) => {
    navigate(`/admin/order/${orderId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6"> 📊 Admin Dashboard</h1>
      {(productsLoading || ordersLoading) ? (
        <p>Loading dashboard data...</p>
      ) : productsError ? (
        <p className="text-red-500">Error fetching products: {productsError}</p>
      ) : ordersError ? (
        <p className="text-red-500"> Error fetching orders: {ordersError}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Revenue Card */}
          <div className="p-6 shadow-xl rounded-lg bg-white border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700"> Total Revenue</h2>
            {/* 💰 FIX: Use optional chaining and default value for safe formatting */}
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${totalSales?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          
          {/* Orders Card */}
          <div className="p-6 shadow-xl rounded-lg bg-white border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700"> Total Orders</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalOrders ?? 0}</p>
            <Link to="/admin/orders" className="text-blue-500 hover:underline mt-2 inline-block text-sm">
              Manage Orders →
            </Link>
          </div>
          
          {/* Products Card */}
          <div className="p-6 shadow-xl rounded-lg bg-white border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700"> Total Products</h2>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{products?.length ?? 0}</p>
            <Link
              to="/admin/products"
              className="text-blue-500 hover:underline mt-2 inline-block text-sm"
            >
              Manage Products →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="mt-8 shadow-xl rounded-lg overflow-hidden bg-white">
        <h2 className="text-2xl font-bold mb-4 p-4 border-b"> Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-500">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Total Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                // Displaying only the first 5 orders as "recent"
                orders.slice(0, 5).map((order) => ( 
                  <tr
                    key={order._id}
                    // 🖱️ FIX: Use onClick handler to navigate to order details page
                    onClick={() => handleOrderClick(order._id)}
                    className="border-b hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
                  >
                    <td className="p-4 font-mono text-sm">{order._id}</td>
                    <td className="p-4">{order.user?.name ?? 'N/A'}</td>
                    <td className="p-4 font-semibold">${order.totalPrice?.toFixed(2) ?? '0.00'}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {order.status}
                        </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;