import React from 'react';
import { Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/src/providers';
import type { EvidencePhoto } from '@/src/types/complaint';
import { GImage } from './GImage';
import { GIcon } from './GIcon';
import { GText } from './GText';

const MAX_PHOTOS = 3;
const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

export type ImageUploaderSlotsProps = {
  photos: EvidencePhoto[];
  onChange: (next: EvidencePhoto[]) => void;
  max?: number;
  label?: string;
  helperText?: string;
};

function mimeFromUri(uri: string, reported?: string | null): string {
  if (reported && ALLOWED.has(reported.toLowerCase())) {
    return reported.toLowerCase() === 'image/jpg' ? 'image/jpeg' : reported.toLowerCase();
  }
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
}

export function ImageUploaderSlots({
  photos,
  onChange,
  max = MAX_PHOTOS,
  label = 'Evidence photos',
  helperText,
}: ImageUploaderSlotsProps) {
  const theme = useTheme();
  const slots = Array.from({ length: max });

  const addPhoto = async () => {
    if (photos.length >= max) {
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }
    const asset = result.assets[0];
    const mimeType = mimeFromUri(asset.uri, asset.mimeType);
    if (!ALLOWED.has(mimeType) && mimeType !== 'image/jpeg') {
      return;
    }
    const name = asset.fileName?.trim() || `evidence-${photos.length + 1}.jpg`;
    onChange([...photos, { uri: asset.uri, name, mimeType }]);
  };

  const removeAt = (index: number) => {
    onChange(photos.filter((_, current) => current !== index));
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <GText variant="label">{label}</GText>
      <GText variant="caption" color="secondary">
        {helperText ?? `Up to ${max} JPG, PNG, or WEBP photos. File size is checked by the server.`}
      </GText>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {slots.map((_, index) => {
          const photo = photos[index];
          if (photo) {
            return (
              <View key={photo.uri} style={{ position: 'relative' }}>
                <GImage
                  uri={photo.uri}
                  width={88}
                  height={88}
                  accessibilityLabel={`Evidence photo ${index + 1}`}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  onPress={() => removeAt(index)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.overlay.scrim,
                  }}
                >
                  <GIcon name="close" size="sm" color={theme.colors.text.inverse} />
                </Pressable>
              </View>
            );
          }
          return (
            <Pressable
              key={`empty-${index}`}
              accessibilityRole="button"
              accessibilityLabel="Add evidence photo"
              onPress={() => {
                void addPhoto();
              }}
              style={{
                width: 88,
                height: 88,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border.default,
                backgroundColor: theme.colors.bg.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GIcon name="add" color={theme.colors.text.secondary} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
