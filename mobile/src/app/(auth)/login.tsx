import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Monogram, Txt } from '@/components/ui';
import { ErrorBox, Field } from '@/components/auth-ui';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { colors, font, radius, shadow, spacing, rtlRow } from '@/lib/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!email || !password) {
      setError(t.fillAllFields);
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(t.loginError);
      return;
    }
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.heroBg} />
          <View style={styles.header}>
            <Monogram size={72} />
            <Txt type="title" style={styles.center}>{t.loginTitle}</Txt>
            <Txt type="small" style={styles.center}>{t.loginSubtitle}</Txt>
          </View>

          <View style={styles.card}>
            {error ? <ErrorBox message={error} /> : null}

            <Field icon="mail" value={email} onChangeText={setEmail} placeholder={t.email} keyboardType="email-address" autoCapitalizeNone />
            <Field icon="lock" value={password} onChangeText={setPassword} placeholder={t.password} secure />

            <Button title={loading ? t.loggingIn : t.login} onPress={onSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Txt type="small">{t.noAccountQ}</Txt>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
              <Txt type="label">{t.createAccount}</Txt>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: colors.maroon,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: { alignItems: 'center', gap: spacing.xs, zIndex: 1 },
  center: { textAlign: 'center', alignSelf: 'stretch', color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.card,
    zIndex: 1,
  },
  footer: { flexDirection: rtlRow, justifyContent: 'center', alignItems: 'center', gap: spacing.xs, zIndex: 1 },
});
