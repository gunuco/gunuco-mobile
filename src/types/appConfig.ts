export type AppStoreUrls = {
  android?: string;
  ios?: string;
};

export type AppConfig = {
  minVersion?: string;
  latestVersion?: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  storeUrls?: AppStoreUrls;
};

export type AppGate = 'none' | 'maintenance' | 'force_update';

export type AppGateResult = {
  gate: AppGate;
  maintenanceMessage: string | null;
  storeUrl: string | null;
};
