import { axiosInstance } from './tokenService';
import { Gallery } from '../features/gallery/gallerySlice';
import { toastSuccess, toastError } from './toastService';

const API_URL = 'galleries';

const getGalleries = async () => {
  try {
    const response = await axiosInstance.get(`/${API_URL}`);
    return response.data.data?.docs || response.data.data || response.data;
  } catch (error: any) {
    toastError.galleryFetchError();
    throw error;
  }
};

const createGallery = async (data: Gallery) => {
  try {
    const formData = new FormData();
    if (data.image) formData.append('image', data.image);
    formData.append('title', data.title);
    formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    
    const response = await axiosInstance.post(`/${API_URL}`, formData);
    toastSuccess.galleryItemCreated();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to create gallery item';
    toastError.galleryCreateError(errorMessage);
    throw error;
  }
};

const updateGallery = async (data: Gallery) => {
  try {
    const formData = new FormData();
    if (data.image) formData.append('image', data.image);
    formData.append('title', data.title);
    formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    
    const response = await axiosInstance.patch(`/${API_URL}/${data.id}`, formData);
    toastSuccess.galleryItemUpdated();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update gallery item';
    toastError.galleryUpdateError(errorMessage);
    throw error;
  }
};

const deleteGallery = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/${API_URL}/${id}`);
    toastSuccess.galleryItemDeleted();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to delete gallery item';
    toastError.galleryDeleteError(errorMessage);
    throw error;
  }
};

const getCategories = async () => {
  try {
    const response = await axiosInstance.get(`/${API_URL}/categories/list`);
    return response.data.data || response.data;
  } catch (error: any) {
    toastError.error('Failed to load categories', 'There was an error loading the gallery categories.');
    throw error;
  }
};

const galleryService = {
  getGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
  getCategories,
};

export default galleryService;
