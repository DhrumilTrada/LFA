import axios from 'axios';

const API_URL = 'users';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Helper to get auth headers
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
};

export interface UserInput {
  name: string;
  email: string;
  phno: number;
  role: string;
}

export interface UserResponse {
  statusCode: number;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    phno: number;
    role: string;
    isActive: boolean;
    resetPasswordToken: string;
    __v: number;
  };
}

const getUsers = async (): Promise<UserResponse[]> => {
  const response = await axios.get(`${API_BASE_URL}/${API_URL}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const createUser = async (data: UserInput): Promise<UserResponse> => {
  const response = await axios.post(`${API_BASE_URL}/${API_URL}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${API_URL}/${userId}`, {
    headers: getAuthHeaders(),
  });
};


const updateUser = async (userId: string, data: Partial<UserInput>): Promise<UserResponse> => {
  const response = await axios.patch(`${API_BASE_URL}/${API_URL}/${userId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

const userService = {
  getUsers,
  createUser,
  deleteUser,
  updateUser
};

export default userService;
