import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 💡 Helper function to get token from localStorage
const getToken = () => localStorage.getItem("userToken");

// --- Async Thunks ---

// fetch all users (admin only)
export const fetchUsers = createAsyncThunk(
    "admin/fetchUsers", 
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
                {
                    headers: { Authorization: `Bearer ${getToken()}` },
                }
            );
            // Assuming the API response is { user: [...] }
            return response.data; 
        } catch (error) {
            // Consistent error handling
            return rejectWithValue(error.response.data); 
        }
    }
);

// Add a new user
export const addUser = createAsyncThunk(
    "admin/addUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
                userData,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            // Return the full response data for flexible handling in the reducer
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Update user info (Role, Name, or Email)
export const updateUser = createAsyncThunk(
    "admin/updateUser",
    async (payload, { rejectWithValue }) => {
        try {
            const { id, name, email, role } = payload;
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
                { name, email, role },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            return response.data.user; 
        } catch (error) {
            return rejectWithValue(error.response.data); 
        }
    }
);

// Delete a user
export const deleteUser = createAsyncThunk("admin/deleteUser", async (id, { rejectWithValue }) => {
    try {
        await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );
        return id; // Return the ID so we can filter it out of the state
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// --- Admin Slice ---

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        users: [], 
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- Fetch Users ---
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = Array.isArray(action.payload) ? action.payload : []; 
            })
            .addCase(fetchUsers.rejected, (state, action) => { 
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch users"; 
                state.users = []; 
            })

            // --- Add User ---
            .addCase(addUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.loading = false;
                
                // Safely retrieve the new user object
                const newUser = action.payload?.user || action.payload; 

                // CRITICAL FIX: Ensure state.users is an array before pushing
                if (!Array.isArray(state.users)) {
                    state.users = []; 
                }

                // Push only a valid user object
                if (newUser && newUser._id) {
                    state.users.push(newUser); 
                } else {
                    console.warn("addUser fulfilled but payload missing user data:", action.payload);
                }
            })
            .addCase(addUser.rejected, (state, action) => {
                state.loading = false;
                
                // 🚀 ENHANCED LOGGING: Log the full payload from the 400 Bad Request error
                console.error("Add User Failed (Backend Validation Error):", action.payload); 
                
                // Attempt to display the error message from the backend
                const errorMessage = action.payload?.message || action.payload?.error || "Failed to add user. Check console for details (400 Bad Request).";
                
                state.error = errorMessage;
            })

            // --- Update User ---
            .addCase(updateUser.pending, (state) => { 
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const updatedUser = action.payload; 
                
                if (!Array.isArray(state.users)) {
                    state.users = [];
                    return; 
                }

                const userIndex = state.users.findIndex(
                    (user) => user._id === updatedUser._id
                );
                
                if (userIndex !== -1) {
                    state.users[userIndex] = updatedUser;
                }
            })
            .addCase(updateUser.rejected, (state, action) => { 
                state.loading = false;
                state.error = action.payload?.message || "Failed to update user";
            })

            // --- Delete User ---
            .addCase(deleteUser.pending, (state) => { 
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter((user) => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => { 
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete user";
            });
    },
});

export default adminSlice.reducer;