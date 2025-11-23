import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to create a checkout session
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutdata, { rejectWithValue }) => {
    // 1. Retrieve the token
    const token = localStorage.getItem("userToken");

    if (!token) {
      // Handle scenario where token is missing (should be prevented by parent component)
      return rejectWithValue({ message: "Authentication token required for checkout." });
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
        checkoutdata,
        {
          headers: {
            // ✅ CRITICAL FIX: Ensure there is exactly one space between Bearer and the token
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      // Ensure we pass the error message or data structure expected by the rejected case
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Optional: add a reducer to clear the error state
    clearCheckoutError: (state) => {
      state.error = null;
    },
    // Optional: add a reducer to clear the checkout ID/object after finalization
    clearCheckout: (state) => {
        state.checkout = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        // ✅ LOGIC FIX: Set loading to false on success
        state.loading = false; 
        state.checkout = action.payload;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        // The payload is the entire object from rejectWithValue, access the message property safely
        state.error = action.payload.message || "An unknown error occurred."; 
      });
  },
});

export const { clearCheckoutError, clearCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;