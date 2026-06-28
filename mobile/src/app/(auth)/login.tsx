import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Txt } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing } from '@/lib/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(t.loginError);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Txt type="title" color={colors.white}>JAZ</Txt>
          </View>
          <Txt type="title" style={styles.center}>{t.loginTitle}</Txt>
          <Txt type="small" style={styles.center}>{t.loginSubtitle}</Txt>
        </View>

        <View style={styles.form}>
          <View>
            <Txt type="label">{t.email}</Txt>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="example@email.com"
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
          </View>
          <View>
            <Txt type="label">{t.password}</Txt>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
          </View>

          {error ? <Txt type="small" color={colors.maroon}>{error}</Txt> : null}

          <Button title={loading ? t.loggingIn : t.login} onPress={onSubmit} loading={loading} />
          <Txt type="small" style={styles.center}>{t.noAccount}</Txt>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.xxl },
  header: { alignItems: 'center', gap: spacing.sm },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center', alignSelf: 'stretch' },
  form: { gap: spacing.lg },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginTop: spacing.xs,
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'right',
  },
});
