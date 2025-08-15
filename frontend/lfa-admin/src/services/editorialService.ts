import axios from 'axios';

const API_URL = 'editorials';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` } as Record<string, string>;
    }
  }
  return {};
};

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
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await axios.get(`${API_BASE_URL}/${API_URL}?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async createEditorial(data: EditorialInput) {
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

    const response = await axios.post(`${API_BASE_URL}/${API_URL}`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateEditorial(id: string, data: Partial<EditorialInput>) {
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

    const response = await axios.patch(`${API_BASE_URL}/${API_URL}/${id}`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteEditorial(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getEditorialById(id: string) {
    const response = await axios.get(`${API_BASE_URL}/${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
