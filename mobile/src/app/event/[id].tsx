import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, Txt } from '@/components/ui';
import { eventLocation, eventTitle, useEvent } from '@/lib/events';
import { t } from '@/lib/i18n';
import { colors, radius, spacing } from '@/lib/theme';

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Txt type="h3" color={colors.maroon}>‹ رجوع</Txt>
        </Pressable>

        <View style={styles.cover}>
          {event.image_url ? (
            <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
        </View>

        <Txt type="title">{eventTitle(event)}</Txt>

        <View style={styles.badges}>
          {event.country ? <Badge label="دولية" tone="maroon" /> : <Badge label="محلية" tone="green" />}
          {event.featured ? <Badge label="★ مميز" tone="amber" /> : null}
        </View>

        <Card style={{ gap: spacing.sm, borderRadius: radius.lg }}>
          {event.date ? (
            <Txt type="body">📅 {new Date(event.date).toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' })}</Txt>
          ) : null}
          {eventLocation(event) ? <Txt type="body">📍 {eventLocation(event)}</Txt> : null}
          {sector ? <Txt type="body">🏷️ {sector}</Txt> : null}
        </Card>

        {description ? <Txt type="body">{description}</Txt> : null}
      </ScrollView>

      <View style={styles.footer}>
        {/* المرحلة 3: سيفتح هذا نموذج إكمال التسجيل المتصل بالموقع */}
        <Button title={t.register} onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  back: { alignSelf: 'flex-start' },
  cover: { height: 180, borderRadius: radius.lg, backgroundColor: colors.maroon, overflow: 'hidden' },
  badges: { flexDirection: 'row', gap: spacing.sm },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
