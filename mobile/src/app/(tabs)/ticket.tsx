import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button, Card, Txt } from '@/components/ui';
import {
  eventTitle,
  eventLocation,
  formatDate,
  useMyRegistrations,
  type RegistrationWithEvent,
} from '@/lib/events';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';

type StatusKey = 'pending' | 'confirmed' | 'cancelled' | 'attended';

const STATUS_META: Record<StatusKey, { label: string; bg: string; fg: string }> = {
  confirmed: { label: t.ticketStatusConfirmed, bg: colors.greenBg, fg: colors.green },
  attended: { label: t.ticketStatusAttended, bg: colors.greenBg, fg: colors.green },
  pending: { label: t.ticketStatusPending, bg: colors.amberBg, fg: colors.gold },
  cancelled: { label: t.ticketStatusCancelled, bg: colors.redBg, fg: colors.maroon },
};

function getStatusMeta(status?: string | null) {
  if (!status) return STATUS_META.pending;
  const key = status.toLowerCase() as StatusKey;
  return STATUS_META[key] ?? STATUS_META.pending;
}

function TicketCard({ reg, onPress }: { reg: RegistrationWithEvent; onPress: () => void }) {
  const event = reg.events;
  if (!event) return null;

  const meta = getStatusMeta(reg.status);
  const isActive = reg.status === 'confirmed' || reg.status === 'attended';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ticket, pressed && { opacity: 0.92 }]}>
      {isActive ? <View style={styles.ticketAccent} /> : null}
      <View style={styles.ticketBody}>
        <View style={styles.ticketTop}>
          <Txt style={styles.ticketTitle} numberOfLines={2}>{eventTitle(event)}</Txt>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Txt style={[styles.statusText, { color: meta.fg }]}>{meta.label}</Txt>
          </View>
        </View>

        <View style={styles.ticketMeta}>
          {event.date ? (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={13} color={colors.ink3} />
              <Txt style={styles.metaText}>{formatDate(event.date, { day: 'numeric', month: 'short', year: 'numeric' })}</Txt>
            </View>
          ) : null}
          {eventLocation(event) ? (
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={13} color={colors.ink3} />
              <Txt style={styles.metaText} numberOfLines={1}>{eventLocation(event)}</Txt>
            </View>
          ) : null}
        </View>

        {reg.ticket_number ? (
          <View style={styles.ticketNo}>
            <Feather name="hash" size={11} color={colors.ink3} />
            <Txt style={styles.ticketNoText}>{t.ticketNumber}: {reg.ticket_number}</Txt>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function Ticket() {
  const { data: allRegistrations = [], isLoading } = useMyRegistrations();
  const registrations = allRegistrations.filter((r) => r.current_step >= 5);

  const active = registrations.filter((r) => r.status === 'confirmed' || r.status === 'attended');
  const pending = registrations.filter((r) => r.status !== 'confirmed' && r.status !== 'attended' && r.status !== 'cancelled');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Txt type="h2">{t.ticketTitle}</Txt>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.maroon} size="large" />
        </View>
      ) : registrations.length > 0 ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {active.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Feather name="check-circle" size={15} color={colors.green} />
                <Txt style={styles.sectionTitle}>{t.ticketSectionActive}</Txt>
              </View>
              <View style={styles.sectionCards}>
                {active.map((reg) => (
                  <TicketCard
                    key={reg.id}
                    reg={reg}
                    onPress={() => router.push(`/event/${reg.events?.id}`)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {pending.length > 0 ? (
            <>
              <View style={[styles.sectionHeader, { marginTop: active.length > 0 ? spacing.lg : 0 }]}>
                <Feather name="clock" size={15} color={colors.gold} />
                <Txt style={styles.sectionTitle}>{t.ticketSectionPending}</Txt>
              </View>
              <View style={styles.sectionCards}>
                {pending.map((reg) => (
                  <TicketCard
                    key={reg.id}
                    reg={reg}
                    onPress={() => router.push(`/event/${reg.events?.id}`)}
                  />
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Feather name="bookmark" size={36} color={colors.ink3} />
          </View>
          <Txt type="h3">{t.ticketEmpty}</Txt>
          <Txt type="small" style={styles.emptyHint}>{t.ticketEmptyHint}</Txt>
          <Button
            title={t.quickEvents}
            onPress={() => router.push('/(tabs)/events')}
            style={{ marginTop: spacing.lg, minWidth: 180 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingTop: 0, paddingBottom: 100 },
  sectionHeader: { flexDirection: rtlRow, alignItems: 'center', gap: 6, marginVertical: spacing.sm },
  sectionTitle: { fontSize: 13, fontFamily: font.semibold, color: colors.ink },
  sectionCards: { gap: spacing.sm },
  ticket: {
    flexDirection: rtlRow,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  ticketAccent: { width: 4, backgroundColor: colors.green },
  ticketBody: { flex: 1, padding: spacing.md, gap: 6 },
  ticketTop: { flexDirection: rtlRow, justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  ticketTitle: { flex: 1, fontSize: 15, fontFamily: font.semibold, color: colors.ink, lineHeight: 21 },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontFamily: font.bold },
  ticketMeta: { flexDirection: rtlRow, flexWrap: 'wrap', gap: spacing.md },
  metaItem: { flexDirection: rtlRow, alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontFamily: font.regular, color: colors.ink3 },
  ticketNo: { flexDirection: rtlRow, alignItems: 'center', gap: 3, marginTop: 2 },
  ticketNoText: { fontSize: 11, fontFamily: font.medium, color: colors.ink2 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyHint: { textAlign: 'center', maxWidth: 250 },
});
