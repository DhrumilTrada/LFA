import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchGalleries,
  fetchGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  fetchCategories,
  setFilters,
  resetFilters,
  setCurrentPage,
  clearError,
  clearCurrentGallery,
} from '../store/slices/gallerySlice';
import {
  CreateGalleryDto,
  UpdateGalleryDto,
  GalleryPaginationQuery,
} from '../types/gallery.types';

export const useGallery = () => {
  const dispatch = useAppDispatch();
  const galleryState = useAppSelector((state) => (state as any).gallery);

  // Actions
  const loadGalleries = (query?: GalleryPaginationQuery) => {
    dispatch(fetchGalleries(query));
  };

  const loadGalleryById = (id: string) => {
    dispatch(fetchGalleryById(id));
  };

  const addGallery = (galleryData: CreateGalleryDto) => {
    return dispatch(createGallery(galleryData));
  };

  const editGallery = (id: string, galleryData: UpdateGalleryDto) => {
    return dispatch(updateGallery({ id, galleryData }));
  };

  const removeGallery = (id: string) => {
    return dispatch(deleteGallery(id));
  };

  const loadCategories = () => {
    dispatch(fetchCategories());
  };

  const updateFilters = (filters: GalleryPaginationQuery) => {
    dispatch(setFilters(filters));
  };

  const resetAllFilters = () => {
    dispatch(resetFilters());
  };

  const changePage = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const clearGalleryError = () => {
    dispatch(clearError());
  };

  const clearCurrent = () => {
    dispatch(clearCurrentGallery());
  };

  // Auto-load categories on mount
  useEffect(() => {
    if (galleryState.categories.length === 0) {
      loadCategories();
    }
  }, []);

  return {
    // State
    galleries: galleryState.galleries,
    currentGallery: galleryState.currentGallery,
    categories: galleryState.categories,
    loading: galleryState.loading,
    error: galleryState.error,
    pagination: galleryState.pagination,
    filters: galleryState.filters,
    
    // Actions
    loadGalleries,
    loadGalleryById,
    addGallery,
    editGallery,
    removeGallery,
    loadCategories,
    updateFilters,
    resetAllFilters,
    changePage,
    clearGalleryError,
    clearCurrent,
  };
};

export default useGallery;
