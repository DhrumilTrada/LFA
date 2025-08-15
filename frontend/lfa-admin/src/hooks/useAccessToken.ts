import { useCallback } from 'react';

// Custom hook to get access token from localStorage
export function useAccessToken() {
  return useCallback(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user?.access || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  }, []);
}
