import React from 'react';
import { router } from 'expo-router';
import { GButton } from '@/src/components/ui/GButton';
import { GModal } from '@/src/components/ui/GModal';
import { GText } from '@/src/components/ui/GText';
import { useAuth } from '@/src/hooks';
import { useTheme } from '@/src/providers';
import { clearAuthIntent } from '@/src/services/authIntent';

export function SessionExpiredModal() {
  const theme = useTheme();
  const { sessionExpiredVisible, dismissExpired } = useAuth();

  const handleSignIn = () => {
    dismissExpired();
    clearAuthIntent();
    router.push('/(auth)/phone');
  };

  return (
    <GModal visible={sessionExpiredVisible} onClose={dismissExpired} title="Session expired">
      <GText variant="bodyMd" color="secondary">
        Your session has expired. Please sign in again to continue.
      </GText>
      <GButton title="Sign in" fullWidth onPress={handleSignIn} />
      <GButton
        title="Continue browsing"
        variant="ghost"
        fullWidth
        onPress={dismissExpired}
        style={{ marginTop: theme.spacing.xs }}
      />
    </GModal>
  );
}
