import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { materialService } from '../../services/material.service';

export const fetchMaterials = createAsyncThunk(
  'material/fetchAll',
  async (params, thunkAPI) => {
    try {
      const res = await materialService.getMaterials(params);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const uploadMaterial = createAsyncThunk(
  'material/upload',
  async ({ formData, onProgress }, thunkAPI) => {
    try {
      const res = await materialService.uploadMaterial(formData, (e) => {
        if (onProgress && e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      });
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  'material/delete',
  async (id, thunkAPI) => {
    try {
      await materialService.deleteMaterial(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const materialSlice = createSlice({
  name: 'material',
  initialState: {
    items: [],
    stats: {
      totalStorage: 0,
      totalFiles: 0,
    },
    pagination: {
      total: 0,
      page: 1,
      limit: 50,
      pages: 1,
    },
    selectedSubject: 'All',
    searchQuery: '',
    loading: false,
    uploading: false,
    uploadProgress: 0,
    error: null,
  },
  reducers: {
    setSelectedSubject: (state, action) => {
      state.selectedSubject = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearMaterialError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Materials
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.items = payload.materials || [];
        state.stats = payload.stats || { totalStorage: 0, totalFiles: 0 };
        state.pagination = payload.pagination || { total: 0, page: 1, limit: 50, pages: 1 };
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload Material
      .addCase(uploadMaterial.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadMaterial.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        const newMaterial = action.payload;
        if (newMaterial) {
          state.items.unshift(newMaterial);
          state.stats.totalFiles += 1;
          state.stats.totalStorage += newMaterial.fileSize || 0;
          state.pagination.total += 1;
        }
      })
      .addCase(uploadMaterial.rejected, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })

      // Delete Material
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const itemToDelete = state.items.find((i) => i._id === deletedId);
        if (itemToDelete) {
          state.stats.totalStorage = Math.max(0, state.stats.totalStorage - (itemToDelete.fileSize || 0));
          state.stats.totalFiles = Math.max(0, state.stats.totalFiles - 1);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
        state.items = state.items.filter((i) => i._id !== deletedId);
      });
  },
});

export const {
  setSelectedSubject,
  setSearchQuery,
  setUploadProgress,
  clearMaterialError,
} = materialSlice.actions;

export default materialSlice.reducer;
