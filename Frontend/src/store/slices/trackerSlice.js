import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trackerService } from '../../services/tracker.service';

export const submitLog = createAsyncThunk('tracker/submit', async (data, thunkAPI) => {
  try {
    const res = await trackerService.submitLog(data);
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchHistory = createAsyncThunk('tracker/fetchHistory', async (_, thunkAPI) => {
  try {
    const res = await trackerService.getLogs();
    return res.data.logs;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const trackerSlice = createSlice({
  name: 'tracker',
  initialState: {
    submitting: false,
    error: null,
    success: false,
    logs: [],
    loadingLogs: false,
  },
  reducers: {
    resetTrackerState: (state) => {
      state.submitting = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitLog.pending, (state) => { 
        state.submitting = true; 
        state.error = null;
        state.success = false;
      })
      .addCase(submitLog.fulfilled, (state) => {
        state.submitting = false;
        state.success = true;
      })
      .addCase(submitLog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchHistory.pending, (state) => {
        state.loadingLogs = true;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loadingLogs = false;
        state.logs = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loadingLogs = false;
        state.error = action.payload;
      });
  },
});

export const { resetTrackerState } = trackerSlice.actions;
export default trackerSlice.reducer;
