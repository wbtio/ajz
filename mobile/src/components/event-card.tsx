import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Txt } from '@/components/ui';
import { eventLocation, eventTitle, type EventRow } from '@/lib/events';
import { colors, font, radius, shadow, spacing, rtlRow } from '@/lib/theme';

const COVER_TINTS = ['#8b0000', '#1e3a5f', '#5e4a13', '#1f7a4d'];

export const EventCard = memo(function EventCard({ event, index = 0 }: { event: EventRow; index?: number }) {
  const tint = COVER_TINTS[index % COVER_TINTS.length];
  const isIntl = (event.event_type ?? '').toLowerCase().includes('intl') || !!event.country;
  const dateStr = formatDate(event.date);

  return (
    <Pressable
      onPress={() => router.push(`/event/${event.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.thumb, { backgroundColor: tint }]}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Feather name="globe" size={22} color="rgba(255,255,255,0.5)" />
        )}
        {event.featured ? (
          <View style={styles.star}>
            <Feather name="star" size={9} color={colors.white} />
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Txt style={styles.title} numberOfLines={2}>{eventTitle(event)}</Txt>

        <View style={styles.metaRow}>
          {dateStr ? (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={12} color={colors.ink3} />
              <Txt style={styles.metaText}>{dateStr}</Txt>
            </View>
          ) : null}
        </View>

        {eventLocation(event) ? (
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color={colors.ink3} />
            <Txt style={styles.metaText} numberOfLines={1}>{eventLocation(event)}</Txt>
          </View>
        ) : null}

        <View style={styles.tagRow}>
          {isIntl ? (
            <View style={styles.tagIntl}>
              <Txt style={styles.tagIntlText}>دولية</Txt>
            </View>
          ) : (
            <View style={styles.tagLocal}>
              <Txt style={styles.tagLocalText}>محلية</Txt>
            </View>
          )}
          {(event.country_ar || event.country) ? (
            <Txt style={styles.country}>{event.country_ar || event.country}</Txt>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

function formatDate(d?: string | null): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: rtlRow,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow.card,
  },
  thumb: {
    width: 92,
    height: '100%',
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, padding: spacing.md, gap: 5, justifyContent: 'space-between' },
  title: { fontSize: 15, fontFamily: font.semibold, color: colors.ink, lineHeight: 21 },
  metaRow: { gap: 0 },
  metaItem: { flexDirection: rtlRow, alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontFamily: font.regular, color: colors.ink3 },
  tagRow: { flexDirection: rtlRow, alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  tagIntl: { backgroundColor: colors.redBg, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  tagLocal: { backgroundColor: colors.greenBg, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  tagIntlText: { fontSize: 10, fontFamily: font.bold, color: colors.maroon },
  tagLocalText: { fontSize: 10, fontFamily: font.bold, color: colors.green },
  country: { fontSize: 11, fontFamily: font.regular, color: colors.ink3 },
});
