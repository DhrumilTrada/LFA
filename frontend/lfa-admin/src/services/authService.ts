import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
    user: any;
  };
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    payload,
    {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      withCredentials: true,
    }
  );
  return response.data;
};
