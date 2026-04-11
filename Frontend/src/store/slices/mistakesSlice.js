import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mistakesService } from '../../services/mistakes.service';

export const fetchMistakes = createAsyncThunk('mistakes/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await mistakesService.getMistakes();
    return res.data.mistakes;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const addMistake = createAsyncThunk('mistakes/add', async (data, thunkAPI) => {
  try {
    const res = await mistakesService.addMistake(data);
    return res.data; // Assuming backend returns the created object
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const deleteMistake = createAsyncThunk('mistakes/delete', async (id, thunkAPI) => {
  try {
    await mistakesService.deleteMistake(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const mistakesSlice = createSlice({
  name: 'mistakes',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMistakes.pending, (state) => { state.loading = true; })
      .addCase(fetchMistakes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMistakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMistake.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteMistake.fulfilled, (state, action) => {
        state.items = state.items.filter(m => m._id !== action.payload);
      });
  },
});

export default mistakesSlice.reducer;
