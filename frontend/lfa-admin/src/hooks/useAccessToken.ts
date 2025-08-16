import { useCallback } from 'react';
import { getStoredTokens } from '../services/tokenService';

// Custom hook to get access token from localStorage
export function useAccessToken() {
  return useCallback(() => {
    const { accessToken } = getStoredTokens();
    return accessToken;
  }, []);
}
