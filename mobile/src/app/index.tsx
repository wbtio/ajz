import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/sectors';
import { colors } from '@/lib/theme';

export default function Index() {
  const { session, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || (session && profileLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.maroon} size="large" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!profile?.preferred_sector_id) return <Redirect href="/profile-setup" />;
  return <Redirect href="/(tabs)" />;
}
