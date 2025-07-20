import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  GalleryState,
  Gallery,
  CreateGalleryDto,
  UpdateGalleryDto,
  GalleryPaginationQuery,
} from '../../types/gallery.types';
import galleryApiService from '../../services/gallery.service';

// Initial state
const initialState: GalleryState = {
  galleries: [],
  currentGallery: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
  filters: {
    page: 1,
    limit: 10,
  },
};

// Async thunks
export const fetchGalleries = createAsyncThunk(
  'gallery/fetchGalleries',
  async (query: GalleryPaginationQuery | undefined, { rejectWithValue }) => {
    try {
      const response = await galleryApiService.getAllGalleries(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch galleries'
      );
    }
  }
);

export const fetchGalleryById = createAsyncThunk(
  'gallery/fetchGalleryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await galleryApiService.getGalleryById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gallery'
      );
    }
  }
);

export const createGallery = createAsyncThunk(
  'gallery/createGallery',
  async (galleryData: CreateGalleryDto, { rejectWithValue }) => {
    try {
      const response = await galleryApiService.createGallery(galleryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create gallery'
      );
    }
  }
);

export const updateGallery = createAsyncThunk(
  'gallery/updateGallery',
  async (
    { id, galleryData }: { id: string; galleryData: UpdateGalleryDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await galleryApiService.updateGallery(id, galleryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update gallery'
      );
    }
  }
);

export const deleteGallery = createAsyncThunk(
  'gallery/deleteGallery',
  async (id: string, { rejectWithValue }) => {
    try {
      await galleryApiService.deleteGallery(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete gallery'
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'gallery/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await galleryApiService.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

// Gallery slice
const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGallery: (state) => {
      state.currentGallery = null;
    },
    setFilters: (state, action: PayloadAction<GalleryPaginationQuery>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
      };
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch galleries
    builder
      .addCase(fetchGalleries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleries.fulfilled, (state, action) => {
        state.loading = false;
        state.galleries = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchGalleries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch gallery by ID
    builder
      .addCase(fetchGalleryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGallery = action.payload;
        state.error = null;
      })
      .addCase(fetchGalleryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create gallery
    builder
      .addCase(createGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.galleries.unshift(action.payload);
        state.error = null;
      })
      .addCase(createGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update gallery
    builder
      .addCase(updateGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGallery.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.galleries.findIndex(
          (gallery) => gallery._id === action.payload._id
        );
        if (index !== -1) {
          state.galleries[index] = action.payload;
        }
        if (state.currentGallery?._id === action.payload._id) {
          state.currentGallery = action.payload;
        }
        state.error = null;
      })
      .addCase(updateGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete gallery
    builder
      .addCase(deleteGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.galleries = state.galleries.filter(
          (gallery) => gallery._id !== action.payload
        );
        if (state.currentGallery?._id === action.payload) {
          state.currentGallery = null;
        }
        state.error = null;
      })
      .addCase(deleteGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentGallery,
  setFilters,
  resetFilters,
  setCurrentPage,
} = gallerySlice.actions;

export default gallerySlice.reducer;
