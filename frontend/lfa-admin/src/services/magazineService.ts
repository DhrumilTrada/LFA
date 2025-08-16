import { axiosInstance } from './tokenService';
import { toastSuccess, toastError } from './toastService';

const API_URL = 'magazines';

export interface MagazineInput {
  title: string;
  issueNumber: string;
  editor: string;
  status: 'draft' | 'published' | 'archived';
  description?: string;
  year: number;
  image?: any;
  pdf?: any;
  uploadedAt: string;
}

export interface MagazineResponse {
  statusCode: number;
  message: string;
  data: any;
}

const getMagazines = async (params?: any): Promise<MagazineResponse> => {
  try {
    const response = await axiosInstance.get(`/${API_URL}`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    toastError.magazineFetchError();
    throw error;
  }
};

const createMagazine = async (data: MagazineInput): Promise<MagazineResponse> => {
  try {
    const formData = new FormData();
    
    // Append required fields
    formData.append('title', data.title);
    formData.append('issueNumber', data.issueNumber);
    formData.append('editor', data.editor);
    formData.append('status', data.status);
    formData.append('year', data.year.toString());
    formData.append('uploadedAt', data.uploadedAt);
    
    // Append optional fields
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    if (data.pdf) formData.append('pdf', data.pdf);
    
    const response = await axiosInstance.post(`/${API_URL}`, formData);
    toastSuccess.magazineCreated();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to create magazine';
    toastError.magazineCreateError(errorMessage);
    throw error;
  }
};

const updateMagazine = async (id: string, data: Partial<MagazineInput>): Promise<MagazineResponse> => {
  try {
    const formData = new FormData();
    
    // Append fields that are present in data
    if (data.title) formData.append('title', data.title);
    if (data.issueNumber) formData.append('issueNumber', data.issueNumber);
    if (data.editor) formData.append('editor', data.editor);
    if (data.status) formData.append('status', data.status);
    if (data.year) formData.append('year', data.year.toString());
    if (data.uploadedAt) formData.append('uploadedAt', data.uploadedAt);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    if (data.pdf) formData.append('pdf', data.pdf);
    
    const response = await axiosInstance.patch(`/${API_URL}/${id}`, formData);
    toastSuccess.magazineUpdated();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update magazine';
    toastError.magazineUpdateError(errorMessage);
    throw error;
  }
};

const deleteMagazine = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/${API_URL}/${id}`);
    toastSuccess.magazineDeleted();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to delete magazine';
    toastError.magazineDeleteError(errorMessage);
    throw error;
  }
};

const magazineService = {
  getMagazines,
  createMagazine,
  updateMagazine,
  deleteMagazine,
};

export default magazineService;
