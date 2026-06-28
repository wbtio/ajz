import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/event-card';
import { Txt } from '@/components/ui';
import { eventLocation, eventTitle, useEvents, type EventRow } from '@/lib/events';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing } from '@/lib/theme';

type Filter = 'all' | 'intl' | 'local' | 'featured';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: t.filterAll },
  { key: 'intl', label: t.filterIntl },
  { key: 'local', label: t.filterLocal },
  { key: 'featured', label: t.filterFeatured },
];

export default function Events() {
  const { data: events = [], isLoading } = useEvents();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesQuery =
        !query ||
        eventTitle(e).includes(query) ||
        eventLocation(e).includes(query) ||
        (e.country_ar || e.country || '').includes(query);
      const isIntl = !!e.country;
      const matchesFilter =
        filter === 'all' ||
        (filter === 'intl' && isIntl) ||
        (filter === 'local' && !isIntl) ||
        (filter === 'featured' && e.featured);
      return matchesQuery && matchesFilter;
    });
  }, [events, query, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Txt type="h2">{t.eventsTitle}</Txt>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={colors.ink3}
          style={styles.search}
        />
        <View style={styles.chips}>
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Txt type="small" color={on ? colors.white : colors.ink2}>{f.label}</Txt>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.maroon} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          renderItem={({ item, index }) => <EventCard event={item} index={index} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={<Txt type="body" style={{ textAlign: 'center', marginTop: spacing.xxl }}>{t.noEvents}</Txt>}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, gap: spacing.md },
  search: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.ink,
    textAlign: 'right',
  },
  chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});
