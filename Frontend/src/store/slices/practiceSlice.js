import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { db } from '../../services/db';

export const fetchMyTests = createAsyncThunk(
  'practice/fetchMyTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/practice/my-tests');
      const tests = response.data.tests;
      // Cache all fetched tests locally
      if (Array.isArray(tests)) {
        await db.tests.bulkPut(tests);
      }
      return tests;
    } catch (err) {
      try {
        const cachedTests = await db.tests.toArray();
        if (cachedTests && cachedTests.length > 0) {
          console.log('Using local cached tests (offline)');
          return cachedTests;
        }
      } catch (dbErr) {
        console.error('Failed to read from IndexedDB:', dbErr);
      }
      return rejectWithValue(err.response?.data?.message || 'Failed to load tests');
    }
  }
);

export const fetchTestDetails = createAsyncThunk(
  'practice/fetchTestDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/practice/${id}`);
      const test = response.data.test;
      // Cache this test details locally
      if (test) {
        await db.tests.put(test);
      }
      return test;
    } catch (err) {
      try {
        const cachedTest = await db.tests.get(id);
        if (cachedTest) {
          console.log('Using cached test details (offline)');
          return cachedTest;
        }
      } catch (dbErr) {
        console.error('Failed to read test details from IndexedDB:', dbErr);
      }
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

export const fetchLatestResult = createAsyncThunk(
  'practice/fetchLatestResult',
  async (testId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/practice/${testId}/latest-result`);
      return response.data.result;
    } catch (err) {
      try {
        const outboxItems = await db.syncOutbox
          .where('testId')
          .equals(testId)
          .toArray();
        if (outboxItems && outboxItems.length > 0) {
          outboxItems.sort((a, b) => b.timestamp - a.timestamp);
          const latestOutbox = outboxItems[0];
          const accuracy = Math.round((latestOutbox.resultData.score / latestOutbox.resultData.totalQuestions) * 100);
          return {
            ...latestOutbox.resultData,
            accuracy,
            isOfflinePending: true
          };
        }
      } catch (dbErr) {
        console.error('Failed to query syncOutbox in fetchLatestResult:', dbErr);
      }
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch latest result');
    }
  }
);

const practiceSlice = createSlice({
  name: 'practice',
  initialState: {
    tests: [],
    currentTest: null,
    lastResult: null, // For review
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
      .addCase(submitTestResult.fulfilled, (state) => {
        state.submitLoading = false;
        state.success = true;
      })
      // Fetch Latest Result
      .addCase(fetchLatestResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLatestResult.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResult = action.payload;
      })
      .addCase(fetchLatestResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetPracticeState } = practiceSlice.actions;
export default practiceSlice.reducer;
