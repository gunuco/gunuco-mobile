export type GeoPoint = {
  lat: number;
  lng: number;
};

export type OrderTracking = {
  available: boolean;
  status?: string;
  statusLabel?: string;
  etaLabel?: string | null;
  riderLat?: number;
  riderLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  polyline?: GeoPoint[];
  updatedAt?: string;
  stale?: boolean;
  delivered?: boolean;
  cancelled?: boolean;
  message?: string | null;
};

export type OrderRider = {
  displayName?: string;
  photoUrl?: string | null;
  rating?: number | null;
  callAllowed?: boolean;
  chatAllowed?: boolean;
  callNumber?: string;
  message?: string | null;
};
