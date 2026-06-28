import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/event-card';
import { Card, Txt } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useEvents } from '@/lib/events';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing } from '@/lib/theme';

const QUICK = [
  { icon: '🌍', label: t.quickEvents, href: '/(tabs)/events' as const },
  { icon: '📄', label: t.quickInvitations, href: '/(tabs)/events' as const },
  { icon: '🎫', label: t.quickTicket, href: '/(tabs)/ticket' as const },
  { icon: '💬', label: t.quickAssistant, href: '/(tabs)/account' as const },
];

export default function Home() {
  const { user } = useAuth();
  const { data: events = [] } = useEvents();
  const name = (user?.user_metadata?.full_name as string) || (user?.email?.split('@')[0] ?? '');
  const next = events[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.appbar}>
          <View>
            <Txt type="h2" color={colors.maroon}>JAZ</Txt>
            <Txt type="small">{t.welcome}{name ? `، ${name}` : ''}</Txt>
          </View>
          <Txt style={{ fontSize: 20 }}>🔔</Txt>
        </View>

        {next ? (
          <View style={styles.hero}>
            <Txt type="small" color="rgba(255,255,255,0.85)">{t.upcomingDelegation}</Txt>
            <Txt type="h3" color={colors.white} numberOfLines={1}>
              {next.title_ar || next.title}
            </Txt>
            {next.date ? (
              <Txt type="small" color="rgba(255,255,255,0.85)">
                📅 {new Date(next.date).toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Txt>
            ) : null}
          </View>
        ) : null}

        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable key={q.label} style={styles.quick} onPress={() => router.push(q.href)}>
              <Txt style={{ fontSize: 22 }}>{q.icon}</Txt>
              <Txt type="small" style={styles.quickLabel}>{q.label}</Txt>
            </Pressable>
          ))}
        </View>

        <Txt type="h3">{t.recommended}</Txt>
        <View style={{ gap: spacing.md }}>
          {events.slice(0, 4).map((e, i) => (
            <EventCard key={e.id} event={e} index={i} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  appbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hero: {
    backgroundColor: colors.maroon,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quick: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickLabel: { fontSize: 11 },
});
