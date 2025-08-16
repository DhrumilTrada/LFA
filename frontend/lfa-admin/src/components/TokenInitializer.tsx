import { useEffect } from 'react';
import { useTokenManager } from '../hooks/useTokenManager';

/**
 * Component to initialize token management system
 * Should be used in the root layout or main app component
 */
export const TokenInitializer = () => {
  const { initializeTokens } = useTokenManager();

  useEffect(() => {
    // Initialize tokens from localStorage on app start
    initializeTokens();
  }, [initializeTokens]);

  // This component doesn't render anything
  return null;
};
