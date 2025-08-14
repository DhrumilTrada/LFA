import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getMagazines, createMagazine, updateMagazine, deleteMagazine } from './magazineThunks';
import { MagazineInput, MagazineResponse } from '../../services/magazineService';

export interface Magazine {
  id?: string;
  _id?: string;
  title: string;
  issueNumber: string;
  editor: string;
  status: 'draft' | 'published' | 'archived';
  description?: string;
  image?: any;
  pdf?: any;
  year: number;
  uploadedAt: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface MagazineState {
  magazines: Magazine[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: MagazineState = {
  magazines: [],
  loading: false,
  error: null,
  message: null,
};

const magazineSlice = createSlice({
  name: 'magazine',
  initialState,
  reducers: {
    fetchMagazinesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMagazinesSuccess(state, action: PayloadAction<Magazine[]>) {
      state.magazines = action.payload;
      state.loading = false;
    },
    fetchMagazinesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMagazines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMagazines.fulfilled, (state, action: PayloadAction<MagazineResponse>) => {
        state.loading = false;
        state.magazines = action.payload.data.docs || action.payload.data || [];
        state.message = action.payload.message;
      })
      .addCase(getMagazines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMagazine.fulfilled, (state, action: PayloadAction<MagazineResponse>) => {
        state.magazines.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(updateMagazine.fulfilled, (state, action: PayloadAction<MagazineResponse>) => {
        const idx = state.magazines.findIndex(m => m._id === action.payload.data._id || m.id === action.payload.data.id);
        if (idx !== -1) state.magazines[idx] = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(deleteMagazine.fulfilled, (state, action: PayloadAction<string>) => {
        state.magazines = state.magazines.filter(m => m._id !== action.payload && m.id !== action.payload);
      });
  },
});

export default magazineSlice.reducer;
