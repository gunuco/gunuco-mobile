import { APP_NAME } from '@/src/constants';
import { useTheme } from '@/src/providers';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GIcon } from '../ui/GIcon';
import { GText } from '../ui/GText';
import { SearchBar } from '../ui/SearchBar';
import { HeaderActions } from './HeaderActions';

export type HomeHeaderProps = {
  locationLabel: string;
  onLocationPress?: () => void;
  onSearchPress?: () => void;
};

function HomeHeaderComponent({ locationLabel, onLocationPress, onSearchPress }: HomeHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.bg.canvas,
        gap: theme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <GText
          variant="titleMd"
          color="brand"
          style={{ letterSpacing: 0.4, fontWeight: 'bold', fontSize: 30 }}
        >
          {APP_NAME}
        </GText>
        <HeaderActions showProfile showNotifications showCart />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delivery location ${locationLabel}`}
        onPress={onLocationPress}
        style={{
          width: '50%',
          minHeight: theme.dimensions.inputHeight,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
          backgroundColor: theme.colors.bg.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <GIcon name="location-outline" size="sm" color={theme.colors.brand.primary} />
        <GText variant="bodyMd" numberOfLines={2} style={{ flex: 1 }}>
          {locationLabel}
        </GText>
        <GIcon name="chevron-down" size="sm" color={theme.colors.text.secondary} />
      </Pressable>

      <SearchBar
        value=""
        onChangeText={() => undefined}
        placeholder="Search"
        onPress={onSearchPress}
      />
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderComponent);
