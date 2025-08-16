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
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  message: string | null;
}

const initialState: MagazineState = {
  magazines: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
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
      .addCase(createMagazine.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createMagazine.fulfilled, (state, action: PayloadAction<MagazineResponse>) => {
        state.creating = false;
        state.magazines.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createMagazine.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      .addCase(updateMagazine.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateMagazine.fulfilled, (state, action: PayloadAction<MagazineResponse>) => {
        state.updating = false;
        const updatedMagazine = action.payload.data;
        const idx = state.magazines.findIndex(m => 
          (m._id && updatedMagazine._id && m._id === updatedMagazine._id) || 
          (m.id && updatedMagazine.id && m.id === updatedMagazine.id)
        );
        if (idx !== -1) {
          state.magazines[idx] = updatedMagazine;
        }
        state.message = action.payload.message;
      })
      .addCase(updateMagazine.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMagazine.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteMagazine.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        const deletedId = action.payload;
        state.magazines = state.magazines.filter(m => 
          (m._id !== deletedId) && (m.id !== deletedId)
        );
      })
      .addCase(deleteMagazine.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export default magazineSlice.reducer;
