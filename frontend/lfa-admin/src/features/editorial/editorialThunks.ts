import { createAsyncThunk } from '@reduxjs/toolkit';
import { editorialService, EditorialInput, EditorialQueryParams } from '../../services/editorialService';

// Get editorials thunk
export const getEditorials = createAsyncThunk(
  'editorial/getEditorials',
  async (params: EditorialQueryParams, { rejectWithValue }) => {
    try {
      const response = await editorialService.getEditorials(params);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch editorials';
      return rejectWithValue(message);
    }
  }
);

// Create editorial thunk
export const createEditorial = createAsyncThunk(
  'editorial/createEditorial',
  async (editorialData: EditorialInput, { rejectWithValue }) => {
    try {
      const response = await editorialService.createEditorial(editorialData);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create editorial';
      return rejectWithValue(message);
    }
  }
);

// Update editorial thunk
export const updateEditorial = createAsyncThunk(
  'editorial/updateEditorial',
  async ({ id, data }: { id: string; data: Partial<EditorialInput> }, { rejectWithValue }) => {
    try {
      const response = await editorialService.updateEditorial(id, data);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update editorial';
      return rejectWithValue(message);
    }
  }
);

// Delete editorial thunk
export const deleteEditorial = createAsyncThunk(
  'editorial/deleteEditorial',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await editorialService.deleteEditorial(id);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete editorial';
      return rejectWithValue(message);
    }
  }
);

// Get editorial by ID thunk
export const getEditorialById = createAsyncThunk(
  'editorial/getEditorialById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await editorialService.getEditorialById(id);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch editorial';
      return rejectWithValue(message);
    }
  }
);
