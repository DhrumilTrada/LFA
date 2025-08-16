import { axiosInstance } from './tokenService';
import { toastSuccess, toastError } from './toastService';

const API_URL = 'users';

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
  try {
    const response = await axiosInstance.get(`/${API_URL}`);
    return response.data;
  } catch (error: any) {
    toastError.userFetchError();
    throw error;
  }
};

const createUser = async (data: UserInput): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.post(`/${API_URL}`, data);
    toastSuccess.userCreated();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to create user';
    toastError.userCreateError(errorMessage);
    throw error;
  }
};

const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/${API_URL}/${userId}`);
    toastSuccess.userDeleted();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to delete user';
    toastError.userDeleteError(errorMessage);
    throw error;
  }
};

const updateUser = async (userId: string, data: Partial<UserInput>): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.patch(`/${API_URL}/${userId}`, data);
    toastSuccess.userUpdated();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update user';
    toastError.userUpdateError(errorMessage);
    throw error;
  }
};

const userService = {
  getUsers,
  createUser,
  deleteUser,
  updateUser
};

export default userService;
