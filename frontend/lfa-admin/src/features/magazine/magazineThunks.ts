import { createAsyncThunk } from '@reduxjs/toolkit';
import magazineService, { MagazineInput } from '../../services/magazineService';

export const getMagazines = createAsyncThunk(
  'magazine/getMagazines',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      return await magazineService.getMagazines(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createMagazine = createAsyncThunk(
  'magazine/createMagazine',
  async (data: MagazineInput, { rejectWithValue }) => {
    try {
      return await magazineService.createMagazine(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateMagazine = createAsyncThunk(
  'magazine/updateMagazine',
  async ({ id, data }: { id: string; data: Partial<MagazineInput> }, { rejectWithValue }) => {
    try {
      return await magazineService.updateMagazine(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteMagazine = createAsyncThunk(
  'magazine/deleteMagazine',
  async (id: string, { rejectWithValue }) => {
    try {
      await magazineService.deleteMagazine(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
