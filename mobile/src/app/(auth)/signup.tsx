import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button, Monogram, Txt } from '@/components/ui';
import { ErrorBox, Field } from '@/components/auth-ui';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { colors, font, radius, shadow, spacing, rtlRow } from '@/lib/theme';

export default function Signup() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!fullName || !email || !password || !confirm) {
      setError(t.fillAllFields);
      return;
    }
    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.passwordsMismatch);
      return;
    }
    setLoading(true);
    const { error, needsConfirm } = await signUp(fullName.trim(), email.trim(), phone.trim(), password);
    setLoading(false);
    if (error) {
      setError(t.signupError);
      return;
    }
    if (needsConfirm) {
      setConfirmSent(true);
      return;
    }
    router.replace('/profile-setup');
  }

  if (confirmSent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Feather name="mail" size={32} color={colors.white} />
          </View>
          <Txt type="h2" style={styles.center}>{t.confirmEmailSentTitle}</Txt>
          <Txt type="small" style={styles.center}>{t.confirmEmailSent}</Txt>
          <Button
            title={t.backToLogin}
            onPress={() => router.replace('/(auth)/login')}
            style={{ marginTop: spacing.md, alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.heroBg} />
          <View style={styles.header}>
            <Monogram size={72} />
            <Txt type="title" style={styles.center}>{t.signupTitle}</Txt>
            <Txt type="small" style={styles.center}>{t.signupSubtitle}</Txt>
          </View>

          <View style={styles.card}>
            {error ? <ErrorBox message={error} /> : null}

            <Field icon="user" value={fullName} onChangeText={setFullName} placeholder={t.fullName} />
            <Field icon="mail" value={email} onChangeText={setEmail} placeholder={t.email} keyboardType="email-address" autoCapitalizeNone />
            <Field icon="phone" value={phone} onChangeText={setPhone} placeholder={t.phone} keyboardType="phone-pad" />
            <Field icon="lock" value={password} onChangeText={setPassword} placeholder={t.password} secure />
            <Field icon="lock" value={confirm} onChangeText={setConfirm} placeholder={t.confirmPassword} secure />

            <Button title={loading ? t.signingUp : t.signup} onPress={onSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Txt type="small">{t.haveAccountQ}</Txt>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Txt type="label">{t.backToLogin}</Txt>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
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
  confirmWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});
