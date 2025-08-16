import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout, updateTokens } from '../features/auth/authSlice';
import { 
  getStoredTokens, 
  clearStoredTokens, 
  updateStoredTokens,
  refreshAccessToken 
} from '../services/tokenService';

export const useTokenManager = () => {
  const dispatch = useDispatch();

  // Initialize tokens from localStorage on app start
  const initializeTokens = useCallback(() => {
    const { accessToken, refreshToken } = getStoredTokens();
    if (accessToken && refreshToken) {
      dispatch(updateTokens({ accessToken, refreshToken }));
    }
  }, [dispatch]);

  // Manually refresh token
  const manualRefreshToken = useCallback(async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      dispatch(updateTokens({ accessToken: newAccessToken }));
      return newAccessToken;
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      dispatch(logout());
      clearStoredTokens();
      throw error;
    }
  }, [dispatch]);

  // Logout and clear all tokens
  const logoutUser = useCallback(() => {
    dispatch(logout());
    clearStoredTokens();
  }, [dispatch]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const { accessToken } = getStoredTokens();
    return !!accessToken;
  }, []);

  return {
    initializeTokens,
    manualRefreshToken,
    logoutUser,
    isAuthenticated,
  };
};
