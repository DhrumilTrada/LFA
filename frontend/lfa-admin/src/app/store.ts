import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import galleryReducer from '../features/gallery/gallerySlice';
import userReducer from '../features/user/userSlice';
import magazineReducer from '../features/magazine/magazineSlice';
import editorialReducer from '../features/editorial/editorialSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gallery: galleryReducer,
    user: userReducer,
    magazine: magazineReducer,
    editorial: editorialReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
