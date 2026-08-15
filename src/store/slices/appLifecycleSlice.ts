import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppGate } from '@/src/types/appConfig';

type AppLifecycleState = {
  gate: AppGate;
  maintenanceMessage: string | null;
  storeUrl: string | null;
  configChecked: boolean;
  configFailed: boolean;
};

const initialState: AppLifecycleState = {
  gate: 'none',
  maintenanceMessage: null,
  storeUrl: null,
  configChecked: false,
  configFailed: false,
};

const appLifecycleSlice = createSlice({
  name: 'appLifecycle',
  initialState,
  reducers: {
    setAppLifecycle(
      state,
      action: PayloadAction<{
        gate: AppGate;
        maintenanceMessage: string | null;
        storeUrl: string | null;
        configFailed?: boolean;
      }>,
    ) {
      state.gate = action.payload.gate;
      state.maintenanceMessage = action.payload.maintenanceMessage;
      state.storeUrl = action.payload.storeUrl;
      state.configChecked = true;
      state.configFailed = action.payload.configFailed ?? false;
    },
  },
});

export const { setAppLifecycle } = appLifecycleSlice.actions;
export const appLifecycleReducer = appLifecycleSlice.reducer;
