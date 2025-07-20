import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { apiService } from './api.service';

// Initialize API service with store dependencies
export function initializeApiService() {
  // Set token getter
  apiService.setTokenGetter(() => {
    const state = store.getState();
    return (state as any).auth?.token || null;
  });

  // Set unauthorized handler
  apiService.setUnauthorizedHandler(() => {
    store.dispatch(logout());
  });
}

export default initializeApiService;
