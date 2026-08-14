import React from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type MapPressEvent } from 'react-native-maps';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';

export type MapCoordinate = {
  lat: number;
  lng: number;
};

export type MapPickerProps = {
  coordinate?: MapCoordinate | null;
  onChange: (next: MapCoordinate) => void;
};

const INDIA_OVERVIEW = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 18,
  longitudeDelta: 18,
};

export function MapPicker({ coordinate, onChange }: MapPickerProps) {
  const theme = useTheme();
  const region = coordinate
    ? {
        latitude: coordinate.lat,
        longitude: coordinate.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : INDIA_OVERVIEW;

  const onPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onChange({ lat: latitude, lng: longitude });
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <GText variant="label">Map location</GText>
      <GText variant="caption" color="secondary">
        Tap the map to place a delivery pin. Serviceability is confirmed by the backend.
      </GText>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{
          width: '100%',
          height: 220,
          borderRadius: theme.radius.lg,
        }}
        initialRegion={region}
        region={coordinate ? region : undefined}
        onPress={onPress}
        accessibilityLabel="Delivery location map"
      >
        {coordinate ? (
          <Marker
            coordinate={{ latitude: coordinate.lat, longitude: coordinate.lng }}
            accessibilityLabel="Selected location pin"
          />
        ) : null}
      </MapView>
      {coordinate ? (
        <GText variant="caption" color="secondary">
          Pin placed. Backend will validate this location.
        </GText>
      ) : (
        <GText variant="caption" color="danger">
          Place a pin on the map to continue.
        </GText>
      )}
    </View>
  );
}
