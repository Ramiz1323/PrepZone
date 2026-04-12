import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/planner';

export const listPlanners = createAsyncThunk(
  'planner/listPlanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/list`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to list planners');
    }
  }
);

export const fetchPlanner = createAsyncThunk(
  'planner/fetchPlanner',
  async (id, { rejectWithValue }) => {
    try {
      const url = id ? `${API_URL}/${id}` : API_URL;
      const response = await axios.get(url, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch planner');
    }
  }
);

export const savePlanner = createAsyncThunk(
  'planner/savePlanner',
  async ({ id, plans, title, isActive }, { rejectWithValue }) => {
    try {
      const method = id ? 'put' : 'post';
      const url = id ? `${API_URL}/${id}` : API_URL;
      const response = await axios[method](url, { plans, title, isActive }, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save planner');
    }
  }
);

export const setActivePlan = createAsyncThunk(
  'planner/setActivePlan',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/active`, {}, { withCredentials: true });
      dispatch(listPlanners()); // Refresh list to update isActive statuses
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set active plan');
    }
  }
);

export const deletePlanner = createAsyncThunk(
  'planner/deletePlanner',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      dispatch(listPlanners());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete planner');
    }
  }
);

const plannerSlice = createSlice({
  name: 'planner',
  initialState: {
    data: { plans: [], title: 'My Plan', isActive: true },
    allPlanners: [],
    loading: false,
    error: null,
    saveLoading: false
  },
  reducers: {
    clearPlannerData: (state) => {
      state.data = { plans: [], title: 'My Plan', isActive: true };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listPlanners.fulfilled, (state, action) => {
        state.allPlanners = action.payload;
      })
      .addCase(fetchPlanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlanner.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPlanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(savePlanner.pending, (state) => {
        state.saveLoading = true;
      })
      .addCase(savePlanner.fulfilled, (state, action) => {
        state.saveLoading = false;
        state.data = action.payload;
      })
      .addCase(savePlanner.rejected, (state, action) => {
        state.saveLoading = false;
        state.error = action.payload;
      })
      .addCase(setActivePlan.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(deletePlanner.fulfilled, (state, action) => {
        if (state.data._id === action.payload) {
          state.data = { plans: [], title: 'My Plan', isActive: true };
        }
      });
  }
});

export const { clearPlannerData } = plannerSlice.actions;
export default plannerSlice.reducer;
