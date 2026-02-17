import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '@/dtos/User';
import { getStoredToken, setStoredToken, removeStoredToken } from '@/utils/tokenStorage';

interface AuthState {
  user: IUser | null;
  token: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
  initialized: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    setCredentials: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.initialized = true;
      setStoredToken(action.payload.token);
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.initialized = true;

      if (action.payload) setStoredToken(action.payload);
      else removeStoredToken();
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.initialized = true;
      removeStoredToken();
    },
  },
  selectors: {
    selectCurrentUser: (state): IUser | null => state.user,
    selectIsAuthenticated: (state): boolean => Boolean(state.token),
    selectAuthInitialized: (state): boolean => state.initialized,
  },
});

export const { setCredentials, setToken, logout, setAuthInitialized } = authSlice.actions;
export const { selectCurrentUser, selectIsAuthenticated, selectAuthInitialized } = authSlice.selectors;
