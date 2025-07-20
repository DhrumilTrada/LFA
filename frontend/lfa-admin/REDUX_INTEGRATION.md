# Redux Store Integration for LFA Gallery Module

This document explains the production-level Redux store implementation for integrating the frontend with the backend gallery module.

## Overview

The Redux store is configured with:
- **Redux Toolkit** for efficient state management
- **Redux Persist** for state persistence
- **TypeScript** for type safety
- **Async thunks** for API calls
- **Custom hooks** for easy component integration

## Architecture

```
src/
├── store/
│   ├── index.ts              # Store configuration
│   ├── hooks.ts              # Typed hooks
│   └── slices/
│       ├── authSlice.ts      # Authentication state
│       └── gallerySlice.ts   # Gallery state
├── services/
│   ├── api.service.ts        # Base API service
│   ├── auth.service.ts       # Auth API calls
│   ├── gallery.service.ts    # Gallery API calls
│   └── apiServiceInitializer.ts # API service setup
├── hooks/
│   ├── useAuth.ts           # Auth hook
│   └── useGallery.ts        # Gallery hook
├── types/
│   ├── auth.types.ts        # Auth TypeScript types
│   └── gallery.types.ts     # Gallery TypeScript types
└── providers/
    └── ReduxProvider.tsx    # Redux provider component
```

## Configuration

### Environment Variables

Create `.env.local` for development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=LFA Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

Create `.env.production` for production:
```env
NEXT_PUBLIC_API_URL=https://your-production-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-production-domain.com/api
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=LFA Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Usage Examples

### Using the Gallery Hook

```tsx
'use client';

import React, { useEffect } from 'react';
import useGallery from '../hooks/useGallery';

const GalleryComponent = () => {
  const {
    galleries,
    categories,
    loading,
    error,
    loadGalleries,
    addGallery,
    removeGallery,
  } = useGallery();

  useEffect(() => {
    loadGalleries();
  }, []);

  const handleCreateGallery = async (formData: CreateGalleryDto) => {
    try {
      await addGallery(formData);
      loadGalleries(); // Refresh list
    } catch (error) {
      console.error('Failed to create gallery:', error);
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      {galleries.map(gallery => (
        <div key={gallery._id}>
          <h3>{gallery.title}</h3>
          <p>{gallery.description}</p>
          <button onClick={() => removeGallery(gallery._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Using the Auth Hook

```tsx
'use client';

import React from 'react';
import useAuth from '../hooks/useAuth';

const AuthComponent = () => {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please log in</p>
          {/* Login form here */}
        </div>
      )}
    </div>
  );
};
```

### Direct Redux Store Usage

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGalleries } from '../store/slices/gallerySlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const galleries = useAppSelector(state => state.gallery.galleries);
  
  const handleLoadGalleries = () => {
    dispatch(fetchGalleries({ page: 1, limit: 10 }));
  };

  return (
    <div>
      <button onClick={handleLoadGalleries}>Load Galleries</button>
      {/* Render galleries */}
    </div>
  );
};
```

## API Services

### Gallery Service Methods

- `getAllGalleries(query?)` - Get paginated galleries
- `getGalleryById(id)` - Get single gallery
- `createGallery(data)` - Create new gallery with file upload
- `updateGallery(id, data)` - Update gallery
- `deleteGallery(id)` - Delete gallery
- `getCategories()` - Get gallery categories

### Auth Service Methods

- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get current user info
- `refreshToken(token)` - Refresh access token

## State Management Features

### Gallery State

- Galleries list with pagination
- Current gallery for detail view
- Categories list
- Loading states
- Error handling
- Filters and pagination controls

### Auth State

- User information
- Authentication token
- Authentication status
- Loading states
- Error handling

### Persistence

- Auth state is persisted across browser sessions
- Gallery state is not persisted (fresh data on reload)
- Automatic token management in API calls

## TypeScript Integration

All components are fully typed with:
- API response types
- State types
- Component prop types
- Hook return types
- Error types

## Error Handling

- Automatic token refresh on 401 errors
- Global error states in Redux
- Error boundaries for UI components
- Network error handling

## Performance Optimizations

- Memoized selectors
- Optimistic updates
- Lazy loading
- Request deduplication
- Automatic retries

## Testing

The store is configured for easy testing with:
- Mock store providers
- Isolated slice testing
- API service mocking
- Component integration testing

## Production Considerations

- Environment-based API URLs
- Token security
- Error monitoring
- Performance tracking
- State debugging (disabled in production)

## Getting Started

1. Install dependencies: `npm install @reduxjs/toolkit react-redux redux-persist axios`
2. Set up environment variables
3. Wrap your app with `ReduxProvider`
4. Use the provided hooks in your components
5. Configure your backend API endpoints

## Example Routes

- `/gallery` - Gallery management page
- `/login` - Authentication page

The Redux store is now ready for production use with full TypeScript support and comprehensive error handling.
