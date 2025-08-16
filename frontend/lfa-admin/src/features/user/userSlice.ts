import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getUsers, createUser, updateUser, deleteUser } from './userThunks';
import { UserInput, UserResponse } from '../../services/userService';

interface UserState {
  users: UserResponse['data'][];
  user: UserResponse['data'] | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  users: [],
  user: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  message: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.users = action.payload.data || action.payload || [];
        state.message = action.payload.message;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.creating = false;
        state.users.unshift(action.payload.data);
        state.user = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.updating = false;
        const updatedUser = action.payload.data;
        const idx = state.users.findIndex(u => u._id === updatedUser._id);
        if (idx !== -1) {
          state.users[idx] = updatedUser;
        }
        state.user = updatedUser;
        state.message = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        const deletedId = action.payload;
        state.users = state.users.filter(u => u._id !== deletedId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
