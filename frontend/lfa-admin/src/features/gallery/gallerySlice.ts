import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchGalleries, createGallery, updateGallery, deleteGallery, fetchCategories } from './galleryThunks';

export interface Gallery {
  id?: string;
  _id?: string;
  image?: any;
  title: string;
  category: string;
  description?: string;
  createdAt?: string;
  year?: number;
}

export interface Category {
  key: string;
  value: string;
}

interface GalleryState {
  galleries: Gallery[];
  categories: Category[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  message: string | null;
}

const initialState: GalleryState = {
  galleries: [],
  categories: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  message: null,
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    fetchGalleriesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchGalleriesSuccess(state, action: PayloadAction<Gallery[]>) {
      state.galleries = action.payload;
      state.loading = false;
    },
    fetchGalleriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch galleries
      .addCase(fetchGalleries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleries.fulfilled, (state, action: PayloadAction<any>) => {
        state.galleries = action.payload;
        console.log("Thunk success - payload ::", action.payload);
        state.loading = false;
      })
      .addCase(fetchGalleries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create gallery
      .addCase(createGallery.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createGallery.fulfilled, (state, action: PayloadAction<any>) => {
        state.creating = false;
        state.galleries.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createGallery.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // Update gallery
      .addCase(updateGallery.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateGallery.fulfilled, (state, action: PayloadAction<any>) => {
        state.updating = false;
        const idx = state.galleries.findIndex(g => g._id === action.payload.data._id || g.id === action.payload.data.id);
        if (idx !== -1) state.galleries[idx] = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updateGallery.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // Delete gallery
      .addCase(deleteGallery.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteGallery.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.galleries = state.galleries.filter(g => g._id !== action.payload && g.id !== action.payload);
      })
      .addCase(deleteGallery.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});


export const {
  fetchGalleriesStart,
  fetchGalleriesSuccess,
  fetchGalleriesFailure,
} = gallerySlice.actions;

export default gallerySlice.reducer;
