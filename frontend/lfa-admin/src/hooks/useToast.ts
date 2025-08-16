import { useCallback } from 'react';
import {
  toastSuccess,
  toastError,
  toastInfo,
  dismissAllToasts
} from '../services/toastService';

/**
 * Custom hook for easy access to toast notifications
 * Provides common toast methods and utilities
 */
export const useToast = () => {
  // Success toasts
  const success = useCallback((message: string, description?: string) => {
    toastSuccess.success(message, description);
  }, []);

  // Error toasts
  const error = useCallback((message: string, description?: string) => {
    toastError.error(message, description);
  }, []);

  // Info toasts
  const info = useCallback((message: string, description?: string) => {
    toastInfo.info(message, description);
  }, []);

  // Specific success toasts
  const loginSuccess = useCallback(() => {
    toastSuccess.loginSuccess();
  }, []);

  const logoutSuccess = useCallback(() => {
    toastSuccess.logoutSuccess();
  }, []);

  const saveSuccess = useCallback(() => {
    toastSuccess.success('Saved successfully', 'Your changes have been saved.');
  }, []);

  const deleteSuccess = useCallback(() => {
    toastSuccess.success('Deleted successfully', 'The item has been deleted.');
  }, []);

  const updateSuccess = useCallback(() => {
    toastSuccess.success('Updated successfully', 'Your changes have been saved.');
  }, []);

  // Specific error toasts
  const loginError = useCallback((message?: string) => {
    toastError.loginError(message);
  }, []);

  const saveError = useCallback((message?: string) => {
    toastError.error('Save failed', message || 'There was an error saving your changes.');
  }, []);

  const deleteError = useCallback((message?: string) => {
    toastError.error('Delete failed', message || 'There was an error deleting the item.');
  }, []);

  const networkError = useCallback(() => {
    toastError.networkError();
  }, []);

  const unauthorizedError = useCallback(() => {
    toastError.unauthorizedError();
  }, []);

  // Utility functions
  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, []);

  // Form validation helper
  const formValidationError = useCallback((message: string = 'Please check your input') => {
    toastError.error('Validation Error', message);
  }, []);

  // File upload helpers
  const fileUploadSuccess = useCallback(() => {
    toastSuccess.success('File uploaded', 'Your file has been uploaded successfully.');
  }, []);

  const fileUploadError = useCallback((message?: string) => {
    toastError.fileUploadError(message);
  }, []);

  const fileSizeError = useCallback(() => {
    toastError.fileSizeError();
  }, []);

  const fileTypeError = useCallback(() => {
    toastError.fileTypeError();
  }, []);

  return {
    // Generic methods
    success,
    error,
    info,
    
    // Auth specific
    loginSuccess,
    logoutSuccess,
    loginError,
    unauthorizedError,
    
    // CRUD operations
    saveSuccess,
    saveError,
    deleteSuccess,
    deleteError,
    updateSuccess,
    
    // Network
    networkError,
    
    // File operations
    fileUploadSuccess,
    fileUploadError,
    fileSizeError,
    fileTypeError,
    
    // Form validation
    formValidationError,
    
    // Utilities
    dismissAll,
  };
};
