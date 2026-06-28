import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Txt } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { colors, radius, spacing } from '@/lib/theme';

export default function Account() {
  const { user, signOut } = useAuth();
  const name = (user?.user_metadata?.full_name as string) || (user?.email?.split('@')[0] ?? '');

  async function onLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Txt type="h2">{t.accountTitle}</Txt>

        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <Txt type="h2" color={colors.white}>{(name || 'J').charAt(0).toUpperCase()}</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt type="h3">{name || 'مستخدم JAZ'}</Txt>
            <Txt type="small">{user?.email}</Txt>
          </View>
        </Card>

        <Button title={t.logout} variant="ghost" onPress={onLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
