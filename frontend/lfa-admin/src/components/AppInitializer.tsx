'use client';

import { useEffect } from 'react';
import initializeApiService from '../services/apiServiceInitializer';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  useEffect(() => {
    initializeApiService();
  }, []);

  return <>{children}</>;
}
