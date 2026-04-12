import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyTests = createAsyncThunk(
  'practice/fetchMyTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/practice/my-tests');
      return response.data.tests;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load tests');
    }
  }
);

export const fetchTestDetails = createAsyncThunk(
  'practice/fetchTestDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/practice/${id}`);
      return response.data.test;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load test details');
    }
  }
);

export const importNewTest = createAsyncThunk(
  'practice/importNewTest',
  async (testData, { rejectWithValue }) => {
    try {
      const response = await api.post('/practice/import', testData);
      return response.data.test;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to import test');
    }
  }
);

export const submitTestResult = createAsyncThunk(
  'practice/submitTestResult',
  async ({ testId, resultData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/practice/${testId}/submit`, resultData);
      return response.data.result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit results');
    }
  }
);

const practiceSlice = createSlice({
  name: 'practice',
  initialState: {
    tests: [],
    currentTest: null,
    loading: false,
    error: null,
    submitLoading: false,
    success: false
  },
  reducers: {
    resetPracticeState: (state) => {
      state.success = false;
      state.error = null;
      state.currentTest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Tests
      .addCase(fetchMyTests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchMyTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchTestDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTestDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTest = action.payload;
      })
      // Import
      .addCase(importNewTest.pending, (state) => {
        state.submitLoading = true;
      })
      .addCase(importNewTest.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.success = true;
        state.tests.unshift(action.payload);
      })
      .addCase(importNewTest.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload;
      })
      // Submit Result
      .addCase(submitTestResult.pending, (state) => {
        state.submitLoading = true;
      })
      .addCase(submitTestResult.fulfilled, (state) => {
        state.submitLoading = false;
        state.success = true;
      });
  }
});

export const { resetPracticeState } = practiceSlice.actions;
export default practiceSlice.reducer;
