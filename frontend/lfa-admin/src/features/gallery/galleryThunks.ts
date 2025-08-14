import { createAsyncThunk } from '@reduxjs/toolkit';
import galleryService from '../../services/galleryService';
import { Gallery, Category } from './gallerySlice';

export const fetchGalleries = createAsyncThunk(
  'gallery/fetchGalleries',
  async (_, { rejectWithValue }) => {
    try {
      return await galleryService.getGalleries();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGallery = createAsyncThunk(
  'gallery/createGallery',
  async (data: Gallery, { rejectWithValue }) => {
    try {
      return await galleryService.createGallery(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGallery = createAsyncThunk(
  'gallery/updateGallery',
  async (data: Gallery, { rejectWithValue }) => {
    try {
      return await galleryService.updateGallery(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGallery = createAsyncThunk(
  'gallery/deleteGallery',
  async (id: string, { rejectWithValue }) => {
    try {
      return await galleryService.deleteGallery(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'gallery/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await galleryService.getCategories();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
