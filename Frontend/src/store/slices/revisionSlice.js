import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { revisionService } from '../../services/revision.service';

export const fetchRevisions = createAsyncThunk('revision/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await revisionService.getRevisionItems();
    // Handle both cases: { data: { items: [] } } and { items: [] } or just []
    const items = res.data?.items || res.items || (Array.isArray(res) ? res : []);
    return items;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const addRevision = createAsyncThunk('revision/add', async (data, thunkAPI) => {
  try {
    const res = await revisionService.addRevisionItem(data);
    // Handle both { data: item } and just item
    return res.data || res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const toggleRevisionStatus = createAsyncThunk('revision/toggle', async ({ id, status }, thunkAPI) => {
  try {
    const newStatus = status === 'completed' ? 'pending' : 'completed';
    await revisionService.updateRevisionItem(id, { status: newStatus });
    return { id, newStatus };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const deleteRevision = createAsyncThunk('revision/delete', async (id, thunkAPI) => {
  try {
    await revisionService.deleteRevisionItem(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const revisionSlice = createSlice({
  name: 'revision',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevisions.pending, (state) => { state.loading = true; })
      .addCase(fetchRevisions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRevisions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addRevision.fulfilled, (state, action) => {
        if (!Array.isArray(state.items)) state.items = [];
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(toggleRevisionStatus.fulfilled, (state, action) => {
        const item = state.items.find(i => i._id === action.payload.id);
        if (item) {
          item.status = action.payload.newStatus;
        }
      })
      .addCase(deleteRevision.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export default revisionSlice.reducer;
