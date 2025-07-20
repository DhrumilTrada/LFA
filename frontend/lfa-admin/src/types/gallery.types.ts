export interface Gallery {
  _id: string;
  image: string;
  title: string;
  category: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGalleryDto {
  image?: File | string;
  title: string;
  category: string;
  description?: string;
}

export interface UpdateGalleryDto {
  image?: File | string;
  title?: string;
  category?: string;
  description?: string;
}

export interface GalleryCategory {
  key: string;
  value: string;
}

export interface GalleryPaginationQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GalleryState {
  galleries: Gallery[];
  currentGallery: Gallery | null;
  categories: GalleryCategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  filters: GalleryPaginationQuery;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
