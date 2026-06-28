import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Badge, Txt } from '@/components/ui';
import { eventLocation, eventTitle, type EventRow } from '@/lib/events';
import { colors, font, radius, shadow, spacing } from '@/lib/theme';

const GRADIENTS = ['#7a1410', '#13415e', '#5e4a13'];

export function EventCard({ event, index = 0 }: { event: EventRow; index?: number }) {
  const cover = GRADIENTS[index % GRADIENTS.length];
  const isIntl = (event.event_type ?? '').toLowerCase().includes('intl') || !!event.country;

  return (
    <Pressable
      onPress={() => router.push(`/event/${event.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.cover, { backgroundColor: cover }]}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View style={styles.coverRow}>
          {(event.country_ar || event.country) ? (
            <View style={styles.flag}>
              <Txt type="small" color={colors.white}>{event.country_ar || event.country}</Txt>
            </View>
          ) : <View />}
          {event.featured ? (
            <View style={styles.featured}>
              <Txt type="small" color={colors.maroon}>★ مميز</Txt>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.body}>
        <Txt type="h3" numberOfLines={2}>{eventTitle(event)}</Txt>
        <View style={styles.meta}>
          {event.date ? <Txt type="small">📅 {formatDate(event.date)}</Txt> : null}
          {eventLocation(event) ? <Txt type="small">📍 {eventLocation(event)}</Txt> : null}
        </View>
        <View style={styles.badges}>
          {isIntl ? <Badge label="دولية" tone="maroon" /> : <Badge label="محلية" tone="green" />}
        </View>
      </View>
    </Pressable>
  );
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow.card,
  },
  cover: { height: 110, justifyContent: 'flex-end', padding: spacing.sm },
  coverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  flag: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  featured: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  body: { padding: spacing.md, gap: spacing.sm },
  meta: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  badges: { flexDirection: 'row', gap: spacing.sm },
});
