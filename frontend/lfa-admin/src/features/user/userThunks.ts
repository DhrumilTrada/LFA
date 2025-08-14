export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, data }: { userId: string; data: Partial<UserInput> }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(userId, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
import { createAsyncThunk } from '@reduxjs/toolkit';
import userService, { UserInput } from '../../services/userService';

export const getUsers = createAsyncThunk(
  'user/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getUsers();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
)

export const createUser = createAsyncThunk(
  'user/createUser',
  async (data: UserInput, { rejectWithValue }) => {
    try {
      return await userService.createUser(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await userService.deleteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);