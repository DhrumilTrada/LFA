import axios from 'axios';

const API_URL = 'magazines';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` } as Record<string, string>;
    }
  }
  return {} as Record<string, string>;
};

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
  const response = await axios.get(`${API_BASE_URL}/${API_URL}`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

const createMagazine = async (data: MagazineInput): Promise<MagazineResponse> => {
  const formData = new FormData();
  
  // Append all required fields
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
  
  const response = await axios.post(`${API_BASE_URL}/${API_URL}`, formData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const updateMagazine = async (id: string, data: Partial<MagazineInput>): Promise<MagazineResponse> => {
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
  
  const response = await axios.patch(`${API_BASE_URL}/${API_URL}/${id}`, formData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const deleteMagazine = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
};

const magazineService = {
  getMagazines,
  createMagazine,
  updateMagazine,
  deleteMagazine,
};

export default magazineService;
