import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '@/dtos/User';
import { getStoredToken, setStoredToken, removeStoredToken } from '@/utils/tokenStorage';

interface AuthState {
  user: IUser | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: IUser; token: string }>): void => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      setStoredToken(action.payload.token);
    },
    logout: (state): void => {
      state.user = null;
      state.token = null;
      removeStoredToken();
    },
  },
  selectors: {
    selectCurrentUser: (state): IUser | null => state.user,
    selectIsAuthenticated: (state): boolean => state.token !== null,
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const { selectCurrentUser, selectIsAuthenticated } = authSlice.selectors;
