import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Badge, Button, Card, Txt } from '@/components/ui';
import { eventLocation, eventTitle, useEvent } from '@/lib/events';
import { useMyRegistration } from '@/lib/registration';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';

type FeatherName = keyof typeof Feather.glyphMap;

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);
  const { data: registration } = useMyRegistration(id);
  const isSubmitted = !!registration && registration.current_step >= 5;
  const inProgress = !!registration && registration.current_step < 5;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.maroon} size="large" />
      </View>
    );
  }
  if (!event) {
    return (
      <View style={styles.center}>
        <Txt type="body">{t.noEvents}</Txt>
      </View>
    );
  }

  const description = event.description_ar || event.description || '';
  const sector = event.sub_sector_ar || event.sub_sector || event.sector || '';

  const metaRows: { icon: FeatherName; label: string; value: string | null }[] = [
    { icon: 'calendar', label: t.eventDate, value: event.date ? new Date(event.date).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
    { icon: 'map-pin', label: t.eventLocation, value: eventLocation(event) || null },
    { icon: 'tag', label: t.eventSector, value: sector || null },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backRow}>
          <Feather name="chevron-right" size={22} color={colors.maroon} />
          <Txt style={styles.backText}>{t.eventBack}</Txt>
        </Pressable>

        <View style={styles.cover}>
          {event.image_url ? (
            <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Feather name="image" size={32} color="rgba(255,255,255,0.4)" />
            </View>
          )}
        </View>

        <Txt type="title">{eventTitle(event)}</Txt>

        <View style={styles.badges}>
          {event.country ? <Badge label="دولية" tone="maroon" /> : <Badge label="محلية" tone="green" />}
          {event.featured ? <Badge label="★ مميز" tone="amber" /> : null}
        </View>

        <Card style={styles.metaCard}>
          {metaRows.map((row, i) => (
            row.value ? (
              <View key={row.label}>
                <View style={styles.metaRow}>
                  <Feather name={row.icon} size={17} color={colors.maroon} />
                  <View style={styles.metaBody}>
                    <Txt type="small">{row.label}</Txt>
                    <Txt style={styles.metaValue}>{row.value}</Txt>
                  </View>
                </View>
                {i < metaRows.length - 1 ? <View style={styles.metaDivider} /> : null}
              </View>
            ) : null
          ))}
        </Card>

        {description ? (
          <View style={styles.descWrap}>
            <Txt style={styles.descLabel}>{t.eventDescription}</Txt>
            <Txt type="body">{description}</Txt>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {isSubmitted ? (
          <Button title={t.regAlreadyContinue} variant="ghost" onPress={() => router.push('/(tabs)/ticket')} />
        ) : (
          <Button
            title={inProgress ? t.regAlreadyContinue : t.register}
            onPress={() => router.push(`/event/${id}/register`)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  backRow: { flexDirection: rtlRow, alignItems: 'center', gap: 2 },
  backText: { fontSize: 15, fontFamily: font.semibold, color: colors.maroon },
  cover: { height: 180, borderRadius: radius.lg, backgroundColor: colors.maroon, overflow: 'hidden' },
  coverPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: rtlRow, gap: spacing.sm },
  metaCard: { gap: 0 },
  metaRow: { flexDirection: rtlRow, alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  metaBody: { flex: 1, gap: 2 },
  metaValue: { fontSize: 14, fontFamily: font.medium, color: colors.ink },
  metaDivider: { height: 1, backgroundColor: colors.line },
  descWrap: { gap: 6 },
  descLabel: { fontSize: 13, fontFamily: font.semibold, color: colors.ink },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
