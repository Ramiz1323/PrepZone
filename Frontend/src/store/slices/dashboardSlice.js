import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../services/dashboard.service';
import { authService } from '../../services/auth.service';

export const fetchDashboardData = createAsyncThunk('dashboard/fetchAll', async (_, thunkAPI) => {
  try {
    const [summary, weekly] = await Promise.all([
      dashboardService.getSummary(),
      dashboardService.getWeekly(7),
    ]);
    return { summary: summary.data, weekly: weekly.data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchSuggestions = createAsyncThunk('dashboard/fetchSuggestions', async (_, thunkAPI) => {
  try {
    const res = await dashboardService.getSuggestions();
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateDailyGoal = createAsyncThunk('dashboard/updateGoal', async (goal, thunkAPI) => {
  try {
    const res = await authService.updateGoal(goal);
    return res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    summary: null,
    weekly: null,
    suggestions: null,
    loading: false,
    suggestionsLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.weekly = action.payload.weekly;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSuggestions.pending, (state) => { state.suggestionsLoading = true; })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.suggestionsLoading = false;
        state.error = action.payload;
      })
      .addCase(updateDailyGoal.fulfilled, (state, action) => {
        // Update both summary and weekly goal local state
        const newGoal = action.payload.dailyMCQGoal;
        if (state.summary) state.summary.dailyMCQGoal = newGoal;
        if (state.weekly) {
          state.weekly.dailyGoal = newGoal;
          // Recalculate isGoalMet and goalMetDays locally for instant feedback
          state.weekly.dailyBreakdown = state.weekly.dailyBreakdown.map(d => ({
            ...d,
            isGoalMet: d.totalMCQs >= newGoal
          }));
          state.weekly.goalMetDays = state.weekly.dailyBreakdown.filter(d => d.isGoalMet).length;
        }
      });
  },
});

export default dashboardSlice.reducer;
