import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchGalleries } from './galleryThunks';
export interface Gallery {
  id?: string;
  image?: any;
  title: string;
  category: string;
  description?: string;
  createdAt?: string;
}

interface GalleryState {
  galleries: Gallery[];
  loading: boolean;
  error: string | null;
}

const initialState: GalleryState = {
  galleries: [],
  loading: false,
  error: null,
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
    addGallery(state, action: PayloadAction<Gallery>) {
      state.galleries.push(action.payload);
    },
    updateGallery(state, action: PayloadAction<Gallery>) {
      const index = state.galleries.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.galleries[index] = action.payload;
      }
    },
    deleteGallery(state, action: PayloadAction<string>) {
      state.galleries = state.galleries.filter(g => g.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGalleries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleries.fulfilled, (state, action: PayloadAction<Gallery[]>) => {
        state.galleries = action.payload;
        console.log("Thunk success - payload ::", action.payload);
        state.loading = false;
      })
      .addCase(fetchGalleries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});


export const {
  fetchGalleriesStart,
  fetchGalleriesSuccess,
  fetchGalleriesFailure,
  addGallery,
  updateGallery,
  deleteGallery,
} = gallerySlice.actions;

export default gallerySlice.reducer;
