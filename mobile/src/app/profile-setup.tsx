/**
 * شاشة بناء الملف الشخصي — عدّة أسئلة (تخصص + تخصص فرعي + شركة + منصب + مدينة/دولة).
 * إلزامية بعد إنشاء الحساب (لا يوجد تخطّي)، وتُستخدم لاحقاً للتوصيات والتعبئة المسبقة في التسجيل.
 */
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button, Txt } from '@/components/ui';
import { ErrorBox } from '@/components/auth-ui';
import {
  COMPANY_POSITIONS,
  sectorIcon,
  sectorName,
  useSectors,
  useUpdateProfile,
  type CompanyPosition,
} from '@/lib/sectors';
import { t } from '@/lib/i18n';
import { colors, font, radius, shadow, spacing, rtlRow } from '@/lib/theme';

const TOTAL_STEPS = 5;

export default function ProfileSetup() {
  const { data: sectors = [], isLoading } = useSectors();
  const updateProfile = useUpdateProfile();

  const [sectorId, setSectorId] = useState<string | null>(null);
  const [subSector, setSubSector] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPosition, setCompanyPosition] = useState<CompanyPosition | null>(null);
  const [companyPositionOther, setCompanyPositionOther] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const filledCount = [
    !!sectorId,
    !!subSector.trim(),
    !!companyName.trim(),
    !!companyPosition,
    !!city.trim() && !!country.trim(),
  ].filter(Boolean).length;

  async function onSave() {
    if (!sectorId || !subSector.trim() || !companyName.trim() || !companyPosition || !city.trim() || !country.trim()) {
      setError(t.profileSetupEmpty);
      return;
    }
    if (companyPosition === 'other' && !companyPositionOther.trim()) {
      setError(t.profileSetupEmpty);
      return;
    }
    setError(null);
    try {
      await updateProfile.mutateAsync({
        preferredSectorId: sectorId,
        subSector: subSector.trim(),
        companyName: companyName.trim(),
        companyPosition: companyPosition === 'other' ? (companyPositionOther.trim() as CompanyPosition) : companyPosition,
        city: city.trim(),
        country: country.trim(),
      });
      setDone(true);
    } catch {
      setError(t.profileSetupError);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Feather name="check" size={36} color={colors.white} />
          </View>
          <Txt type="h2" style={styles.center}>{t.profileSetupDoneTitle}</Txt>
          <Txt type="small" style={styles.center}>{t.profileSetupDoneMessage}</Txt>
          <Button
            title={t.profileSetupContinue}
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: spacing.md, alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Txt type="h2" style={styles.center}>{t.profileSetupTitle}</Txt>
          <Txt type="small" style={styles.center}>{t.profileSetupSubtitle}</Txt>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { flex: filledCount / TOTAL_STEPS }]} />
        </View>

        {error ? <ErrorBox message={error} /> : null}

        <View style={styles.card}>
          <View style={styles.question}>
            <View style={styles.qHeader}>
              <Feather name="grid" size={16} color={colors.maroon} />
              <Txt type="label">{t.profileSectorQ}</Txt>
            </View>
            {isLoading ? (
              <ActivityIndicator color={colors.maroon} style={{ marginTop: spacing.xs }} />
            ) : (
              <View style={styles.chips}>
                {sectors.map((s) => {
                  const on = sectorId === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => setSectorId(s.id)}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Feather
                        name={sectorIcon(s) as keyof typeof Feather.glyphMap}
                        size={14}
                        color={on ? colors.white : colors.maroon}
                      />
                      <Txt type="small" color={on ? colors.white : colors.ink2}>
                        {sectorName(s)}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.question}>
            <View style={styles.qHeader}>
              <Feather name="tag" size={16} color={colors.maroon} />
              <Txt type="label">{t.profileSubSectorQ}</Txt>
            </View>
            <TextInput
              value={subSector}
              onChangeText={setSubSector}
              placeholder={t.profileSubSectorPlaceholder}
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.question}>
            <View style={styles.qHeader}>
              <Feather name="briefcase" size={16} color={colors.maroon} />
              <Txt type="label">{t.profileCompanyQ}</Txt>
            </View>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder={t.profileCompanyPlaceholder}
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.question}>
            <View style={styles.qHeader}>
              <Feather name="users" size={16} color={colors.maroon} />
              <Txt type="label">{t.profilePositionQ}</Txt>
            </View>
            <View style={styles.chips}>
              {COMPANY_POSITIONS.map((p) => {
                const on = companyPosition === p.value;
                return (
                  <Pressable
                    key={p.value}
                    onPress={() => setCompanyPosition(p.value)}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Txt type="small" color={on ? colors.white : colors.ink2}>
                      {p.label}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
            {companyPosition === 'other' ? (
              <TextInput
                value={companyPositionOther}
                onChangeText={setCompanyPositionOther}
                placeholder={t.profilePositionOtherPlaceholder}
                placeholderTextColor={colors.ink3}
                style={[styles.input, { marginTop: spacing.sm }]}
              />
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.question, styles.rowItem]}>
              <View style={styles.qHeader}>
                <Feather name="map-pin" size={16} color={colors.maroon} />
                <Txt type="label">{t.profileCityQ}</Txt>
              </View>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder={t.profileCityPlaceholder}
                placeholderTextColor={colors.ink3}
                style={styles.input}
              />
            </View>
            <View style={[styles.question, styles.rowItem]}>
              <View style={styles.qHeader}>
                <Feather name="globe" size={16} color={colors.maroon} />
                <Txt type="label">{t.profileCountryQ}</Txt>
              </View>
              <TextInput
                value={country}
                onChangeText={setCountry}
                placeholder={t.profileCountryPlaceholder}
                placeholderTextColor={colors.ink3}
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <Button
          title={updateProfile.isPending ? t.profileSetupSaving : t.profileSetupSave}
          onPress={onSave}
          loading={updateProfile.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', gap: 2, marginBottom: spacing.xs },
  center: { textAlign: 'center', alignSelf: 'stretch' },
  progressTrack: {
    height: 5,
    backgroundColor: colors.line,
    borderRadius: 3,
    flexDirection: rtlRow,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.maroon,
    borderRadius: 3,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    ...shadow.card,
  },
  divider: { height: 1, backgroundColor: colors.line },
  question: { gap: 8 },
  row: { flexDirection: rtlRow, gap: spacing.md },
  rowItem: { flex: 1 },
  qHeader: { flexDirection: rtlRow, alignItems: 'center', gap: 6 },
  chips: { flexDirection: rtlRow, flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.ink,
    writingDirection: 'rtl',
  },
});
