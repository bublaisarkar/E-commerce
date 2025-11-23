import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function to get the current token
const getToken = () => `Bearer ${localStorage.getItem("userToken")}`;

// --- Async Thunks ---

// Fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        {
          headers: { Authorization: getToken() },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// update order delivery status
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        { status },
        {
          headers: { Authorization: getToken() },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// delete an order
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      // ✅ CRITICAL FIX: Added the missing '/' before ${id}
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`, 
        {
          headers: { Authorization: getToken() },
        }
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// --- Admin Order Slice ---

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    totalOrders: 0,
    totalSales: 0,
    loading: false,
    error: null,
  },
  reducers: {
      clearOrderError: (state) => {
          state.error = null;
      }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch all orders ---
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        // 💡 Protective check if the payload is an array of orders
        if (Array.isArray(action.payload)) {
            state.orders = action.payload;
            state.totalOrders = action.payload.length;
            
            // calculate total sales
            const totalSales = action.payload.reduce((acc, order) => {
              return acc + (order.totalPrice || 0); // Use 0 if totalPrice is missing
            }, 0);
            state.totalSales = totalSales;
        } else {
            // Handle case where API returns data in a wrapper object (e.g., {orders: [...], totalOrders: 10})
            // If the wrapper object contains the required fields, update state here.
            state.orders = action.payload.orders || []; 
            state.totalOrders = action.payload.totalOrders || 0;
            state.totalSales = action.payload.totalSales || 0;
        }
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message || "Failed to fetch all orders";
      })
      
      // --- Update Order Status ---
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        
        const orderIndex = state.orders.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        // Recalculate totals as the price might have changed (e.g., if status update triggers a fee)
        state.totalSales = state.orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update order status";
      })
      
      // --- Delete Order ---
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out the deleted order
        const orderIdToDelete = action.payload;
        const deletedOrder = state.orders.find(order => order._id === orderIdToDelete);

        state.orders = state.orders.filter(
          (order) => order._id !== orderIdToDelete
        );
        
        // Update totals
        if (deletedOrder) {
            state.totalOrders -= 1;
            state.totalSales -= (deletedOrder.totalPrice || 0);
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete order";
      });
  },
});

export const { clearOrderError } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;