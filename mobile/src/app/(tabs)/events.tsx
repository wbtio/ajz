import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { EventCard } from '@/components/event-card';
import { FilterSheet, emptyFilters, countActiveFilters, type FilterState } from '@/components/filter-sheet';
import { Txt } from '@/components/ui';
import { eventLocation, eventTitle, useEvents, type EventRow } from '@/lib/events';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';

export default function Events() {
  const { data: events = [], isLoading } = useEvents();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const uniqueCountries = useMemo(() => {
    const list = events.map((e) => e.country_ar || e.country).filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (query) {
        const title = eventTitle(e);
        const loc = eventLocation(e);
        const country = e.country_ar || e.country || '';
        if (!title.includes(query) && !loc.includes(query) && !country.includes(query)) return false;
      }
      if (filters.sector && e.sector !== filters.sector && e.sector_id !== filters.sector) return false;
      if (filters.subSector && e.sub_sector !== filters.subSector) return false;
      if (filters.country) {
        const eventCountry = e.country_ar || e.country || '';
        if (eventCountry !== filters.country) return false;
      }
      if (filters.month && e.date) {
        const m = new Date(e.date).getMonth().toString();
        if (m !== filters.month) return false;
      }
      return true;
    });
  }, [events, query, filters]);

  const activeCount = countActiveFilters(filters);

  const keyExtractor = useCallback((e: EventRow) => e.id, []);
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<EventRow>) => <EventCard event={item} index={index} />,
    []
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
          <Feather name="search" size={17} color={searchFocused ? colors.maroon : colors.ink3} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={colors.ink3}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={styles.search}
          />
          {query.length > 0 ? (
            <Pressable hitSlop={12} onPress={() => setQuery('')} style={styles.clearBtn}>
              <Feather name="x" size={15} color={colors.ink3} />
            </Pressable>
          ) : null}
          <Pressable
            hitSlop={8}
            onPress={() => setShowFilter(true)}
            style={({ pressed }) => [styles.filterBtn, activeCount > 0 && styles.filterBtnActive, pressed && { opacity: 0.8 }]}
          >
            <Feather name="sliders" size={16} color={activeCount > 0 ? colors.white : colors.ink2} />
            {activeCount > 0 ? (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.maroon} size="large" />
        </View>
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="search" size={28} color={colors.ink3} />
              <Txt type="h3">{t.noEvents}</Txt>
              <Txt type="small" style={styles.emptyHint}>{t.noEventsHint}</Txt>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onChange={setFilters}
        countries={uniqueCountries}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  searchWrap: {
    flexDirection: rtlRow,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingRight: spacing.sm,
    paddingLeft: spacing.sm,
  },
  searchWrapFocused: { borderColor: colors.maroon, borderWidth: 1.5 },
  searchIcon: { marginHorizontal: 2 },
  search: {
    flex: 1,
    paddingVertical: 11,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.ink,
    writingDirection: 'rtl',
  },
  clearBtn: { padding: 2, marginHorizontal: 4 },
  filterBtn: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    position: 'relative',
  },
  filterBtnActive: { backgroundColor: colors.maroon },
  filterCount: {
    position: 'absolute',
    top: -5,
    left: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  filterCountText: { fontSize: 9, fontFamily: font.bold, color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.sm },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl },
  emptyHint: { textAlign: 'center', maxWidth: 220 },
});
