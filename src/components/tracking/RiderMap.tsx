import React, { useMemo } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/src/providers';
import type { OrderTracking } from '@/src/types/tracking';
import { GText } from '../ui/GText';

export type RiderMapProps = {
  tracking: OrderTracking;
};

export function RiderMap({ tracking }: RiderMapProps) {
  const theme = useTheme();
  const rider =
    typeof tracking.riderLat === 'number' && typeof tracking.riderLng === 'number'
      ? { latitude: tracking.riderLat, longitude: tracking.riderLng }
      : null;
  const destination =
    typeof tracking.destinationLat === 'number' && typeof tracking.destinationLng === 'number'
      ? { latitude: tracking.destinationLat, longitude: tracking.destinationLng }
      : null;

  const region = useMemo(() => {
    const anchor = rider ?? destination;
    if (!anchor) {
      return {
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 18,
        longitudeDelta: 18,
      };
    }
    return {
      latitude: anchor.latitude,
      longitude: anchor.longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }, [destination, rider]);

  const route = (tracking.polyline ?? []).map((point) => ({
    latitude: point.lat,
    longitude: point.lng,
  }));

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{
          width: '100%',
          height: 280,
          borderRadius: theme.radius.lg,
        }}
        region={region}
        accessibilityLabel="Live rider tracking map"
      >
        {rider ? (
          <Marker coordinate={rider} title="Rider" accessibilityLabel="Rider location" />
        ) : null}
        {destination ? (
          <Marker
            coordinate={destination}
            title="Delivery"
            pinColor={theme.colors.brand.primary}
            accessibilityLabel="Delivery destination"
          />
        ) : null}
        {route.length > 1 ? (
          <Polyline coordinates={route} strokeColor={theme.colors.map.route} strokeWidth={4} />
        ) : null}
      </MapView>
      {!rider ? (
        <GText variant="caption" color="secondary">
          Live location is temporarily unavailable.
        </GText>
      ) : null}
    </View>
  );
}
