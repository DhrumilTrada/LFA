import { toast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

// Success toast variants
export const toastSuccess = {
  // Auth toasts
  loginSuccess: () => toast.success('Welcome back!', {
    description: 'You have been successfully logged in.',
    duration: 3000,
  }),
  
  logoutSuccess: () => toast.success('Logged out', {
    description: 'You have been successfully logged out.',
    duration: 3000,
  }),
  
  tokenRefreshSuccess: () => toast.success('Session renewed', {
    description: 'Your session has been automatically renewed.',
    duration: 2000,
  }),
  
  profileUpdateSuccess: () => toast.success('Profile updated', {
    description: 'Your profile has been successfully updated.',
    duration: 3000,
  }),
  
  passwordResetRequestSuccess: () => toast.success('Reset email sent', {
    description: 'Password reset instructions have been sent to your email.',
    duration: 4000,
  }),
  
  passwordResetSuccess: () => toast.success('Password reset', {
    description: 'Your password has been successfully reset.',
    duration: 3000,
  }),

  // Editorial toasts
  editorialCreated: () => toast.success('Editorial created', {
    description: 'The editorial has been successfully created.',
    duration: 3000,
  }),
  
  editorialUpdated: () => toast.success('Editorial updated', {
    description: 'The editorial has been successfully updated.',
    duration: 3000,
  }),
  
  editorialDeleted: () => toast.success('Editorial deleted', {
    description: 'The editorial has been successfully deleted.',
    duration: 3000,
  }),

  // Gallery toasts
  galleryItemCreated: () => toast.success('Gallery item added', {
    description: 'The gallery item has been successfully added.',
    duration: 3000,
  }),
  
  galleryItemUpdated: () => toast.success('Gallery item updated', {
    description: 'The gallery item has been successfully updated.',
    duration: 3000,
  }),
  
  galleryItemDeleted: () => toast.success('Gallery item deleted', {
    description: 'The gallery item has been successfully deleted.',
    duration: 3000,
  }),

  // Magazine toasts
  magazineCreated: () => toast.success('Magazine created', {
    description: 'The magazine has been successfully created.',
    duration: 3000,
  }),
  
  magazineUpdated: () => toast.success('Magazine updated', {
    description: 'The magazine has been successfully updated.',
    duration: 3000,
  }),
  
  magazineDeleted: () => toast.success('Magazine deleted', {
    description: 'The magazine has been successfully deleted.',
    duration: 3000,
  }),

  // User toasts
  userCreated: () => toast.success('User created', {
    description: 'The user has been successfully created.',
    duration: 3000,
  }),
  
  userUpdated: () => toast.success('User updated', {
    description: 'The user has been successfully updated.',
    duration: 3000,
  }),
  
  userDeleted: () => toast.success('User deleted', {
    description: 'The user has been successfully deleted.',
    duration: 3000,
  }),

  // Generic success
  success: (message: string, description?: string) => toast.success(message, {
    description,
    duration: 3000,
  }),
};

// Error toast variants
export const toastError = {
  // Auth errors
  loginError: (message?: string) => toast.error('Login failed', {
    description: message || 'Invalid credentials. Please try again.',
    duration: 4000,
  }),
  
  logoutError: () => toast.error('Logout failed', {
    description: 'There was an error logging you out. Please try again.',
    duration: 4000,
  }),
  
  tokenRefreshError: () => toast.error('Session expired', {
    description: 'Your session has expired. Please log in again.',
    duration: 4000,
  }),
  
  unauthorizedError: () => toast.error('Access denied', {
    description: 'You are not authorized to perform this action.',
    duration: 4000,
  }),
  
  profileUpdateError: (message?: string) => toast.error('Profile update failed', {
    description: message || 'There was an error updating your profile.',
    duration: 4000,
  }),

  // Editorial errors
  editorialCreateError: (message?: string) => toast.error('Failed to create editorial', {
    description: message || 'There was an error creating the editorial.',
    duration: 4000,
  }),
  
  editorialUpdateError: (message?: string) => toast.error('Failed to update editorial', {
    description: message || 'There was an error updating the editorial.',
    duration: 4000,
  }),
  
  editorialDeleteError: (message?: string) => toast.error('Failed to delete editorial', {
    description: message || 'There was an error deleting the editorial.',
    duration: 4000,
  }),
  
  editorialFetchError: () => toast.error('Failed to load editorials', {
    description: 'There was an error loading the editorials.',
    duration: 4000,
  }),

  // Gallery errors
  galleryCreateError: (message?: string) => toast.error('Failed to add gallery item', {
    description: message || 'There was an error adding the gallery item.',
    duration: 4000,
  }),
  
  galleryUpdateError: (message?: string) => toast.error('Failed to update gallery item', {
    description: message || 'There was an error updating the gallery item.',
    duration: 4000,
  }),
  
  galleryDeleteError: (message?: string) => toast.error('Failed to delete gallery item', {
    description: message || 'There was an error deleting the gallery item.',
    duration: 4000,
  }),
  
  galleryFetchError: () => toast.error('Failed to load gallery', {
    description: 'There was an error loading the gallery items.',
    duration: 4000,
  }),

  // Magazine errors
  magazineCreateError: (message?: string) => toast.error('Failed to create magazine', {
    description: message || 'There was an error creating the magazine.',
    duration: 4000,
  }),
  
  magazineUpdateError: (message?: string) => toast.error('Failed to update magazine', {
    description: message || 'There was an error updating the magazine.',
    duration: 4000,
  }),
  
  magazineDeleteError: (message?: string) => toast.error('Failed to delete magazine', {
    description: message || 'There was an error deleting the magazine.',
    duration: 4000,
  }),
  
  magazineFetchError: () => toast.error('Failed to load magazines', {
    description: 'There was an error loading the magazines.',
    duration: 4000,
  }),

  // User errors
  userCreateError: (message?: string) => toast.error('Failed to create user', {
    description: message || 'There was an error creating the user.',
    duration: 4000,
  }),
  
  userUpdateError: (message?: string) => toast.error('Failed to update user', {
    description: message || 'There was an error updating the user.',
    duration: 4000,
  }),
  
  userDeleteError: (message?: string) => toast.error('Failed to delete user', {
    description: message || 'There was an error deleting the user.',
    duration: 4000,
  }),
  
  userFetchError: () => toast.error('Failed to load users', {
    description: 'There was an error loading the users.',
    duration: 4000,
  }),

  // Network errors
  networkError: () => toast.error('Network error', {
    description: 'Please check your internet connection and try again.',
    duration: 4000,
  }),
  
  serverError: () => toast.error('Server error', {
    description: 'There was a server error. Please try again later.',
    duration: 4000,
  }),
  
  // File upload errors
  fileUploadError: (message?: string) => toast.error('File upload failed', {
    description: message || 'There was an error uploading the file.',
    duration: 4000,
  }),
  
  fileSizeError: () => toast.error('File too large', {
    description: 'The selected file is too large. Please choose a smaller file.',
    duration: 4000,
  }),
  
  fileTypeError: () => toast.error('Invalid file type', {
    description: 'The selected file type is not supported.',
    duration: 4000,
  }),

  // Generic error
  error: (message: string, description?: string) => toast.error(message, {
    description,
    duration: 4000,
  }),
};

// Info toasts
export const toastInfo = {
  sessionWarning: () => toast.info('Session expiring soon', {
    description: 'Your session will expire in 5 minutes.',
    duration: 5000,
  }),
  
  autoSave: () => toast.info('Auto-saved', {
    description: 'Your changes have been automatically saved.',
    duration: 2000,
  }),
  
  info: (message: string, description?: string) => toast.info(message, {
    description,
    duration: 3000,
  }),
};

// Helper function to dismiss all toasts
export const dismissAllToasts = () => toast.dismiss();

// Helper function to dismiss a specific toast
export const dismissToast = (toastId: string | number) => toast.dismiss(toastId);
