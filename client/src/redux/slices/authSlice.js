import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/v1/auth';

// Add default axios interceptor for auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/login`, credentials);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Login failed' });
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const verifyEmailOtp = createAsyncThunk('auth/verifyOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async ({ email }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/resend-otp`, { email });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return rejectWithValue('No token');
    const res = await axios.get(`${API_URL}/me`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch session');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await axios.post(`${API_URL}/logout`);
  } catch (e) {
    console.error(e);
  }
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: true,
    error: null,
    unverifiedEmail: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUnverifiedEmail: (state, action) => {
      state.unverifiedEmail = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    updateUserInState: (state, action) => {
      if (action.payload.user) {
        state.user = { ...state.user, ...action.payload.user };
      }
      if (action.payload.profile) {
        state.profile = { ...state.profile, ...action.payload.profile };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.unverifiedEmail = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.isUnverified) {
          state.unverifiedEmail = action.payload.email;
        }
        state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.unverifiedEmail = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // OTP Verification
      .addCase(verifyEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.unverifiedEmail = null;
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FetchMe
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.token = null;
        state.isAuthenticated = false;
        state.unverifiedEmail = null;
      });
  },
});

export const { clearError, setUnverifiedEmail, setToken, updateUserInState } = authSlice.actions;
export default authSlice.reducer;
