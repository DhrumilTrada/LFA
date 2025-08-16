import { axiosInstance } from './tokenService';
import { toastSuccess, toastError } from './toastService';

const API_URL = 'editorials';

export interface EditorialInput {
  title: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  excerpt?: string;
  content: string;
  tags?: string[];
  featured?: boolean;
  image?: File;
  pdf?: File;
}

export interface EditorialResponse {
  id?: string;
  _id?: string;
  title: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  excerpt?: string;
  content: string;
  tags?: string[];
  featured?: boolean;
  image?: string;
  pdf?: string;
  uploadedAt?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EditorialQueryParams {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const editorialService = {
  async getEditorials(params: EditorialQueryParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get(`/${API_URL}?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      toastError.editorialFetchError();
      throw error;
    }
  },

  async createEditorial(data: EditorialInput) {
    try {
      const formData = new FormData();
      
      // Append all text fields
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('status', data.status);
      formData.append('content', data.content);
      
      if (data.excerpt) {
        formData.append('excerpt', data.excerpt);
      }
      
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => formData.append('tags[]', tag));
      }
      
      if (data.featured !== undefined) {
        formData.append('featured', data.featured.toString());
      }

      // Append files
      if (data.image) {
        formData.append('image', data.image);
      }
      
      if (data.pdf) {
        formData.append('pdf', data.pdf);
      }

      const response = await axiosInstance.post(`/${API_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toastSuccess.editorialCreated();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create editorial';
      toastError.editorialCreateError(errorMessage);
      throw error;
    }
  },

  async updateEditorial(id: string, data: Partial<EditorialInput>) {
    try {
      const formData = new FormData();
      
      // Append all text fields that are provided
      if (data.title) formData.append('title', data.title);
      if (data.category) formData.append('category', data.category);
      if (data.status) formData.append('status', data.status);
      if (data.content) formData.append('content', data.content);
      if (data.excerpt) formData.append('excerpt', data.excerpt);
      
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => formData.append('tags[]', tag));
      }
      
      if (data.featured !== undefined) {
        formData.append('featured', data.featured.toString());
      }

      // Append files if provided
      if (data.image) {
        formData.append('image', data.image);
      }
      
      if (data.pdf) {
        formData.append('pdf', data.pdf);
      }

      const response = await axiosInstance.patch(`/${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toastSuccess.editorialUpdated();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update editorial';
      toastError.editorialUpdateError(errorMessage);
      throw error;
    }
  },

  async deleteEditorial(id: string) {
    try {
      const response = await axiosInstance.delete(`/${API_URL}/${id}`);
      toastSuccess.editorialDeleted();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete editorial';
      toastError.editorialDeleteError(errorMessage);
      throw error;
    }
  },

  async getEditorialById(id: string) {
    try {
      const response = await axiosInstance.get(`/${API_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load editorial';
      toastError.error('Failed to load editorial', errorMessage);
      throw error;
    }
  },
};
