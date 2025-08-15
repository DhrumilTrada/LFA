import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getEditorials, createEditorial, updateEditorial, deleteEditorial } from './editorialThunks';

export interface Editorial {
  id?: string;
  _id?: string;
  title: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  excerpt?: string;
  content: string;
  tags?: string[];
  featured?: boolean;
  image?: any;
  pdf?: any;
  uploadedAt?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EditorialState {
  editorials: Editorial[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: EditorialState = {
  editorials: [],
  loading: false,
  error: null,
  message: null,
};

const editorialSlice = createSlice({
  name: 'editorial',
  initialState,
  reducers: {
    fetchEditorialsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEditorialsSuccess(state, action: PayloadAction<Editorial[]>) {
      state.editorials = action.payload;
      state.loading = false;
    },
    fetchEditorialsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearMessage(state) {
      state.message = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get editorials
    builder
      .addCase(getEditorials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEditorials.fulfilled, (state, action) => {
        state.loading = false;
        state.editorials = action.payload.data || [];
        state.message = action.payload.message;
      })
      .addCase(getEditorials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch editorials';
      });

    // Create editorial
    builder
      .addCase(createEditorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEditorial.fulfilled, (state, action) => {
        state.loading = false;
        state.editorials.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createEditorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create editorial';
      });

    // Update editorial
    builder
      .addCase(updateEditorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEditorial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.editorials.findIndex(
          (editorial) => editorial._id === action.payload.data._id || editorial.id === action.payload.data.id
        );
        if (index !== -1) {
          state.editorials[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateEditorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update editorial';
      });

    // Delete editorial
    builder
      .addCase(deleteEditorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEditorial.fulfilled, (state, action) => {
        state.loading = false;
        state.editorials = state.editorials.filter(
          (editorial) => editorial._id !== action.meta.arg && editorial.id !== action.meta.arg
        );
        state.message = action.payload.message;
      })
      .addCase(deleteEditorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete editorial';
      });
  },
});

export const {
  fetchEditorialsStart,
  fetchEditorialsSuccess,
  fetchEditorialsFailure,
  clearMessage,
  clearError,
} = editorialSlice.actions;

export default editorialSlice.reducer;
