import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  customerId: string | null;
  phone: string | null;
  name: string | null;
  sessionExpiredVisible: boolean;
};

const initialState: AuthState = {
  status: 'unknown',
  customerId: null,
  phone: null,
  name: null,
  sessionExpiredVisible: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(
      state,
      action: PayloadAction<{ customerId: string; phone: string; name?: string | null }>,
    ) {
      state.status = 'authenticated';
      state.customerId = action.payload.customerId;
      state.phone = action.payload.phone;
      state.name = action.payload.name ?? null;
      state.sessionExpiredVisible = false;
    },
    setUnauthenticated(state) {
      state.status = 'unauthenticated';
      state.customerId = null;
      state.phone = null;
      state.name = null;
    },
    setAuthUnknown(state) {
      state.status = 'unknown';
    },
    markSessionExpired(state) {
      state.status = 'unauthenticated';
      state.customerId = null;
      state.phone = null;
      state.name = null;
      state.sessionExpiredVisible = true;
    },
    dismissSessionExpired(state) {
      state.sessionExpiredVisible = false;
    },
  },
});

export const {
  setAuthenticated,
  setUnauthenticated,
  setAuthUnknown,
  markSessionExpired,
  dismissSessionExpired,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
