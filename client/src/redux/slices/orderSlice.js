import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk to fetch user orders
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      // Assuming response.data is an array of orders
      return response.data;
    } catch (error) {
      // Use error.response.data if the server sends a structured error
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to fetch orders details by ID
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      // ❗ CRITICAL FIX: The return keyword is necessary here
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    totalOrders: 0,
    orderDetails: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Optional: Add a reducer to clear order details when navigating away
    clearOrderDetails: (state) => {
        state.orderDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming action.payload is the array of orders
        state.orders = action.payload; 
        // Note: If backend returns { orders: [...], totalOrders: N }, adjust here:
        // state.orders = action.payload.orders;
        // state.totalOrders = action.payload.totalOrders;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        // Ensure you are accessing the error message correctly from the payload
        state.error = action.payload.message || "Failed to fetch orders";
      })

      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        // Ensure you are accessing the error message correctly from the payload
        state.error = action.payload.message || "Failed to fetch order details";
      });
  },
});

export const { clearOrderDetails } = orderSlice.actions; // Export any added reducer actions
export default orderSlice.reducer;