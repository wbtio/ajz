import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Txt } from '@/components/ui';
import { useSectors, sectorName } from '@/lib/sectors';
import { SUB_SECTORS, getSectorKey } from '@/lib/sub-sectors';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';

export type FilterState = {
  sector: string;
  subSector: string;
  country: string;
  month: string;
};

export const emptyFilters: FilterState = { sector: '', subSector: '', country: '', month: '' };

export function countActiveFilters(f: FilterState): number {
  return [f.sector, f.subSector, f.country, f.month].filter(Boolean).length;
}

type FeatherName = keyof typeof Feather.glyphMap;

const FIELD_ICONS: Record<keyof FilterState, FeatherName> = {
  sector: 'grid',
  subSector: 'tag',
  country: 'globe',
  month: 'calendar',
};

export function FilterSheet({
  visible,
  onClose,
  filters,
  onChange,
  countries,
}: {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  countries: string[];
}) {
  const { data: sectors = [] } = useSectors();
  const sectorKey = getSectorKey(filters.sector);
  const subOptions = sectorKey ? SUB_SECTORS[sectorKey] : [];

  function set(key: keyof FilterState, value: string) {
    if (key === 'sector') {
      onChange({ ...filters, sector: value, subSector: '' });
    } else {
      onChange({ ...filters, [key]: value });
    }
  }

  function clear() {
    onChange(emptyFilters);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Txt type="h3">{t.filterTitle}</Txt>
            <Pressable hitSlop={12} onPress={onClose}>
              <Feather name="x" size={22} color={colors.ink2} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
            <FilterSection icon="grid" label={t.filterSector}>
              <Chip
                label={t.filterAllSectors}
                selected={!filters.sector}
                onPress={() => set('sector', '')}
              />
              {sectors.map((s) => {
                const slug = s.slug ?? s.id;
                return (
                  <Chip
                    key={s.id}
                    label={sectorName(s)}
                    selected={filters.sector === slug}
                    onPress={() => set('sector', slug)}
                  />
                );
              })}
            </FilterSection>

            {subOptions.length > 0 ? (
              <FilterSection icon="tag" label={t.filterSubSector}>
                <Chip
                  label={t.filterAllSubSectors}
                  selected={!filters.subSector}
                  onPress={() => set('subSector', '')}
                />
                {subOptions.map((sub) => (
                  <Chip
                    key={sub.slug}
                    label={sub.ar}
                    selected={filters.subSector === sub.slug}
                    onPress={() => set('subSector', sub.slug)}
                  />
                ))}
              </FilterSection>
            ) : null}

            <FilterSection icon="globe" label={t.filterCountry}>
              <Chip
                label={t.filterAllCountries}
                selected={!filters.country}
                onPress={() => set('country', '')}
              />
              {countries.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={filters.country === c}
                  onPress={() => set('country', c)}
                />
              ))}
            </FilterSection>

            <FilterSection icon="calendar" label={t.filterMonth}>
              <Chip
                label={t.filterAllMonths}
                selected={!filters.month}
                onPress={() => set('month', '')}
              />
              {t.months.map((m, i) => (
                <Chip
                  key={i}
                  label={m}
                  selected={filters.month === String(i)}
                  onPress={() => set('month', String(i))}
                />
              ))}
            </FilterSection>
          </ScrollView>

          <View style={styles.sheetFooter}>
            <Pressable style={styles.clearBtn} onPress={clear}>
              <Feather name="rotate-ccw" size={15} color={colors.ink2} />
              <Txt style={styles.clearText}>{t.filterClear}</Txt>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FilterSection({
  icon,
  label,
  children,
}: {
  icon: FeatherName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Feather name={icon} size={15} color={colors.maroon} />
        <Txt style={styles.sectionLabel}>{label}</Txt>
      </View>
      <View style={styles.chipWrap}>
        {children}
      </View>
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipOn,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Txt
        style={[styles.chipText, selected && styles.chipTextOn]}
        numberOfLines={1}
      >
        {label}
      </Txt>
      {selected ? <Feather name="check" size={13} color={colors.white} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetHeader: {
    flexDirection: rtlRow,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  scroll: { paddingHorizontal: spacing.lg },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  sectionLabel: { fontSize: 13, fontFamily: font.semibold, color: colors.ink },
  chipWrap: { flexDirection: rtlRow, flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  chipText: { fontSize: 12, fontFamily: font.regular, color: colors.ink2 },
  chipTextOn: { color: colors.white, fontFamily: font.semibold },
  sheetFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  clearBtn: { flexDirection: rtlRow, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm },
  clearText: { fontSize: 13, fontFamily: font.semibold, color: colors.ink2 },
});
