import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button, Card, Txt } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { COMPANY_POSITIONS, sectorName, useProfile, useSectors } from '@/lib/sectors';
import { t } from '@/lib/i18n';
import { colors, font, radius, rtlRow, spacing } from '@/lib/theme';

function positionLabel(value?: string | null): string | null {
  if (!value) return null;
  const found = COMPANY_POSITIONS.find((p) => p.value === value);
  if (found) return found.label;
  return value;
}

function Cell({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.cell}>
      <Txt style={styles.cellLabel}>{label}</Txt>
      <Txt style={styles.cellValue} numberOfLines={1}>{value ?? t.accountNoData}</Txt>
    </View>
  );
}

export default function Account() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: sectors = [] } = useSectors();
  const name = (user?.user_metadata?.full_name as string) || (user?.email?.split('@')[0] ?? '');
  const mySector = sectors.find((s) => s.id === profile?.preferred_sector_id);

  async function onLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Txt type="h2">{t.accountTitle}</Txt>
          <Pressable hitSlop={8} onPress={() => router.push('/profile-setup')} style={styles.editBtn}>
            <Feather name="edit-2" size={13} color={colors.maroon} />
            <Txt style={styles.editText}>{t.editProfile}</Txt>
          </Pressable>
        </View>

        <Card style={styles.profileRow}>
          <View style={styles.avatar}>
            <Txt type="h2" color={colors.white}>{(name || 'J').charAt(0).toUpperCase()}</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt type="h3">{name || 'مستخدم JAZ'}</Txt>
            <Txt type="small">{user?.email}</Txt>
          </View>
        </Card>

        <Card style={styles.dataCard}>
          <Txt style={styles.caption}>{t.accountSectionInfo}</Txt>
          <View style={styles.grid}>
            <Cell label={t.accountEmail} value={user?.email ?? null} />
            <Cell label={t.accountPhone} value={profile?.phone ?? null} />
          </View>
          <View style={styles.grid}>
            <Cell label={t.accountCity} value={profile?.city ?? null} />
            <Cell label={t.accountCountry} value={profile?.country ?? null} />
          </View>

          <View style={styles.sectionDivider} />

          <Txt style={styles.caption}>{t.accountSectionProfessional}</Txt>
          <View style={styles.grid}>
            <Cell label={t.specialization} value={mySector ? sectorName(mySector) : null} />
            <Cell label={t.accountSubSector} value={profile?.sub_sector ?? null} />
          </View>
          <View style={styles.grid}>
            <Cell label={t.accountCompany} value={profile?.company_name ?? null} />
            <Cell label={t.accountPosition} value={positionLabel(profile?.company_position)} />
          </View>
        </Card>

        <Button title={t.logout} variant="ghost" onPress={onLogout} />

        <Txt style={styles.version}>{t.accountVersion}</Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 },
  titleRow: { flexDirection: rtlRow, alignItems: 'center', justifyContent: 'space-between' },
  editBtn: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.redBg,
  },
  editText: { fontSize: 11, fontFamily: font.semibold, color: colors.maroon },
  profileRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataCard: { gap: 6, paddingVertical: spacing.sm },
  caption: { fontSize: 11, fontFamily: font.semibold, color: colors.maroon, lineHeight: 14 },
  grid: { flexDirection: rtlRow, gap: spacing.md },
  cell: { flex: 1, gap: 0 },
  cellLabel: { fontSize: 10, fontFamily: font.regular, color: colors.ink3, lineHeight: 13 },
  cellValue: { fontSize: 13, fontFamily: font.medium, color: colors.ink, lineHeight: 17 },
  sectionDivider: { height: 1, backgroundColor: colors.line },
  version: { fontSize: 10, fontFamily: font.regular, color: colors.ink3, textAlign: 'center', marginTop: 0 },
});
