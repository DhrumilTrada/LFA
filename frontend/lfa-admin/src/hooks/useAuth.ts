import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  clearError,
} from '../store/slices/authSlice';
import { LoginCredentials } from '../types/auth.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => (state as any).auth);

  // Actions
  const login = (credentials: LoginCredentials) => {
    return dispatch(loginUser(credentials)).unwrap();
  };

  const register = (userData: { name: string; email: string; password: string }) => {
    return dispatch(registerUser(userData)).unwrap();
  };

  const logout = () => {
    return dispatch(logoutUser());
  };

  const getCurrentUserInfo = () => {
    return dispatch(getCurrentUser());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Auto-fetch user on app start if authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.token && !authState.user) {
      getCurrentUserInfo();
    }
  }, [authState.isAuthenticated, authState.token, authState.user]);

  return {
    // State
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    
    // Actions
    login,
    register,
    logout,
    getCurrentUserInfo,
    clearAuthError,
  };
};

export default useAuth;
