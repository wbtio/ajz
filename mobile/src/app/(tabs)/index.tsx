import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { EventCard } from '@/components/event-card';
import { Monogram, Txt } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useEvents } from '@/lib/events';
import { useProfile } from '@/lib/sectors';
import { useNotifications } from '@/lib/notifications';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';

type FeatherName = keyof typeof Feather.glyphMap;

const QUICK: { icon: FeatherName; label: string; href: string }[] = [
  { icon: 'compass', label: t.quickEvents, href: '/(tabs)/events' },
  { icon: 'send', label: t.quickInvitations, href: '/(tabs)/events' },
  { icon: 'bookmark', label: t.quickTicket, href: '/(tabs)/ticket' },
  { icon: 'help-circle', label: t.quickAssistant, href: '/notifications' },
];

export default function Home() {
  const { user } = useAuth();
  const { data: events = [] } = useEvents();
  const { data: profile } = useProfile();
  const { unreadCount } = useNotifications();
  const name = (user?.user_metadata?.full_name as string) || (user?.email?.split('@')[0] ?? '');

  const bySector = profile?.preferred_sector_id
    ? events.filter((e) => e.sector_id === profile.preferred_sector_id)
    : [];
  const recommended = bySector.length ? bySector : events;
  const next = recommended[0] ?? events[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Monogram size={40} />
          <Pressable hitSlop={12} onPress={() => router.push('/notifications')} style={styles.bellBtn}>
            <Feather name="bell" size={20} color={colors.ink2} />
            {unreadCount > 0 ? (
              <View style={styles.bellBadge}>
                <Txt style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Txt>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Txt type="h2">{t.welcome}{name ? `، ${name}` : ''}</Txt>

        {next ? (
          <Pressable
            onPress={() => router.push(`/event/${next.id}`)}
            style={({ pressed }) => [styles.hero, pressed && { opacity: 0.96 }]}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <Feather name="calendar" size={11} color={colors.maroon} />
                <Txt style={styles.heroBadgeText}>{t.upcomingDelegation}</Txt>
              </View>
            </View>
            <Txt type="h3" numberOfLines={2} style={styles.heroTitle}>
              {next.title_ar || next.title}
            </Txt>
            {next.date ? (
              <Txt type="small" style={styles.heroDate}>
                {new Date(next.date).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Txt>
            ) : null}
            <View style={styles.heroCta}>
              <Txt style={styles.heroCtaText}>{t.register}</Txt>
              <Feather name="chevron-left" size={16} color={colors.maroon} />
            </View>
          </Pressable>
        ) : null}

        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable
              key={q.label}
              style={({ pressed }) => [styles.quick, pressed && { opacity: 0.85 }]}
              onPress={() => router.push(q.href as any)}
            >
              <Feather name={q.icon} size={19} color={colors.maroon} />
              <Txt style={styles.quickLabel} numberOfLines={1}>{q.label}</Txt>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Txt type="h3">{t.recommended}</Txt>
          <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/events')}>
            <Txt style={styles.seeAll}>{t.seeAll}</Txt>
          </Pressable>
        </View>
        <View style={{ gap: spacing.md }}>
          {recommended.slice(0, 4).map((e, i) => (
            <EventCard key={e.id} event={e} index={i} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 100 },
  header: { flexDirection: rtlRow, justifyContent: 'space-between', alignItems: 'center' },
  bellBtn: { position: 'relative' },
  bellBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  bellBadgeText: { fontSize: 9, fontFamily: font.bold, color: colors.white },
  hero: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroTop: { flexDirection: rtlRow, justifyContent: 'flex-start' },
  heroBadge: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.redBg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: { fontSize: 11, fontFamily: font.medium, color: colors.maroon },
  heroTitle: { marginTop: 2 },
  heroDate: { marginTop: 2 },
  heroCta: { flexDirection: rtlRow, alignItems: 'center', gap: 4, marginTop: 6 },
  heroCtaText: { fontSize: 13, fontFamily: font.semibold, color: colors.maroon },
  quickRow: { flexDirection: rtlRow, gap: spacing.sm },
  quick: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 5,
  },
  quickLabel: { fontSize: 11, fontFamily: font.medium, color: colors.ink2, textAlign: 'center' },
  sectionRow: { flexDirection: rtlRow, justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 13, fontFamily: font.semibold, color: colors.maroon },
});
