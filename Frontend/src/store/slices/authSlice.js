import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    return await authService.login(email, password);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async ({ name, email, password }, thunkAPI) => {
  try {
    return await authService.register(name, email, password);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.errors ? error.errors[0].msg : error.message);
  }
});

export const fetchUser = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
  try {
    return await authService.getMe();
  } catch (error) {
    return thunkAPI.rejectWithValue('Session expired');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await authService.logout();
    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  appLoading: true,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Synchronous escape hatch
      state.user = null;
      state.isAuthenticated = false;
      state.appLoading = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User (Init)
      .addCase(fetchUser.pending, (state) => { state.appLoading = true; })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.appLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.appLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      // Tracker Integration
      .addMatcher(
        (action) => action.type === 'tracker/submit/fulfilled',
        (state, action) => {
          if (action.payload.user) {
            state.user = action.payload.user;
          }
        }
      );
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
