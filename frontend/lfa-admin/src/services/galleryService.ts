import axios from 'axios';
import { Gallery } from '../features/gallery/gallerySlice';
import { useAccessToken } from '../hooks/useAccessToken';

const API_URL = 'galleries';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';


// Helper to get auth headers
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3VwZXItYWRtaW4iLCJzdWIiOiI2ODc3ZjY1ODBjMmVlZmQ4ZjFlZTVhYmUiLCJyZWZyZXNoVG9rZW5JZCI6IjY4N2QyZjFjMTllMTNlMzk0MmNkMWU2MiIsImlhdCI6MTc1MzAzNDUyNCwiZXhwIjoxNzUzMDM4MTI0fQ.ydG8xWygb4RCBC5dvdyXv8zHkyR9QAheEHVikDg458E";
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
};

const getGalleries = async () => {
  const response = await axios.get(`${API_BASE_URL}/${API_URL}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const createGallery = async (data: Gallery) => {
  const formData = new FormData();
  if (data.image) formData.append('image', data.image);
  formData.append('title', data.title);
  formData.append('category', data.category);
  if (data.description) formData.append('description', data.description);
  const response = await axios.post(`${API_BASE_URL}/${API_URL}`, formData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const updateGallery = async (data: Gallery) => {
  const formData = new FormData();
  if (data.image) formData.append('image', data.image);
  formData.append('title', data.title);
  formData.append('category', data.category);
  if (data.description) formData.append('description', data.description);
  const response = await axios.put(`${API_BASE_URL}/${API_URL}/${data.id}`, formData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const deleteGallery = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const galleryService = {
  getGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
};

export default galleryService;
