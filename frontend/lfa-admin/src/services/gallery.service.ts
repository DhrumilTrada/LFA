import apiService from './api.service';
import {
  Gallery,
  CreateGalleryDto,
  UpdateGalleryDto,
  GalleryCategory,
  GalleryPaginationQuery,
  ApiResponse,
} from '../types/gallery.types';

class GalleryApiService {
  private readonly baseUrl = '/galleries';

  async getAllGalleries(query?: GalleryPaginationQuery): Promise<ApiResponse<Gallery[]>> {
    const params = new URLSearchParams();
    
    if (query) {
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.category) params.append('category', query.category);
      if (query.search) params.append('search', query.search);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    }
    
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return apiService.get<ApiResponse<Gallery[]>>(url);
  }

  async getGalleryById(id: string): Promise<ApiResponse<Gallery>> {
    return apiService.get<ApiResponse<Gallery>>(`${this.baseUrl}/${id}`);
  }

  async createGallery(galleryData: CreateGalleryDto): Promise<ApiResponse<Gallery>> {
    const formData = new FormData();
    
    if (galleryData.image instanceof File) {
      formData.append('image', galleryData.image);
    }
    
    formData.append('title', galleryData.title);
    formData.append('category', galleryData.category);
    
    if (galleryData.description) {
      formData.append('description', galleryData.description);
    }

    return apiService.uploadFile<ApiResponse<Gallery>>(this.baseUrl, formData);
  }

  async updateGallery(id: string, galleryData: UpdateGalleryDto): Promise<ApiResponse<Gallery>> {
    // Check if image is being updated
    if (galleryData.image instanceof File) {
      const formData = new FormData();
      formData.append('image', galleryData.image);
      
      if (galleryData.title) formData.append('title', galleryData.title);
      if (galleryData.category) formData.append('category', galleryData.category);
      if (galleryData.description) formData.append('description', galleryData.description);

      return apiService.uploadFile<ApiResponse<Gallery>>(`${this.baseUrl}/${id}`, formData);
    } else {
      // No image update, send as JSON
      return apiService.patch<ApiResponse<Gallery>>(`${this.baseUrl}/${id}`, galleryData);
    }
  }

  async deleteGallery(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  async getCategories(): Promise<ApiResponse<GalleryCategory[]>> {
    return apiService.get<ApiResponse<GalleryCategory[]>>(`${this.baseUrl}/categories`);
  }
}

export const galleryApiService = new GalleryApiService();
export default galleryApiService;
