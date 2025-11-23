import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import { useDispatch, useSelector } from "react-redux";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  if (loading) return <p className="text-center py-20">Loading order details...</p>;
  if (error) return <p className="text-center py-20 text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6"> Order Details</h2>
      {!orderDetails ? (
        <p className="text-center py-20">No Order details found for this ID.</p>
      ) : (
        <div className="p-4 sm:p-6 rounded-lg border shadow-md">
          
          {/* Order Info */}
          <div className="flex flex-col sm:flex-row justify-between mb-8 border-b pb-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold">
                Order ID: <span className="text-gray-700">#{orderDetails._id}</span>
              </h3>
              <p className="text-gray-600">
                Date Placed: {new Date(orderDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
              <span
                className={`${
                  orderDetails.isPaid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                } px-3 py-1 rounded-full text-sm font-medium mb-2`}
              >
                Payment Status: {orderDetails.isPaid ? "Paid" : "Pending"}
              </span>
              <span
                className={`${
                  orderDetails.isDelivered
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                } px-3 py-1 rounded-full text-sm font-medium mb-2`}
              >
                Delivery Status: {orderDetails.isDelivered ? "Delivered" : "Pending"}
              </span>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 border-b pb-6">
            <div>
              <h4 className="text-lg font-semibold mb-2"> Payment Info</h4>
              <p>Payment Method: <span className="text-gray-600">{orderDetails.paymentMethod || 'N/A'}</span></p>
              <p>Status: <span className="text-gray-600">{orderDetails.isPaid ? "Paid" : "Unpaid"}</span></p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2"> Shipping Info</h4>
              <p>Shipping Method: <span className="text-gray-600">{orderDetails.shippingMethod || 'Standard'}</span></p>
              <p className="text-gray-600">
                Address: 
                {` ${orderDetails.shippingAddress.address}, ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.country}`}
              </p>
            </div>
          </div>

          {/* Product list */}
          <div className="overflow-x-auto">
            <h4 className="text-xl font-semibold mb-4"> Products in Order</h4>
            <table className="min-w-full text-gray-600 mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Unit Price</th>
                  <th className="py-3 px-4 text-left">Quantity</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.orderItems.map((item) => (
                  <tr key={item.productId} className="border-b">
                    <td className="py-3 px-4 flex items-center">
                      <img
                        src={item.image || "/images/placeholder.jpg"} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg mr-4 border"
                      />
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-900 font-bold">
                    <td colSpan="3" className="py-3 px-4 text-right text-lg">Order Total:</td>
                    <td className="py-3 px-4 text-right text-lg text-green-700">
                        ${orderDetails.totalPrice.toFixed(2)}
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Back to Orders Link */}
          <Link to="/my-orders" className="text-blue-600 hover:underline font-medium mt-4 inline-block">
            ← Back to My Orders
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;