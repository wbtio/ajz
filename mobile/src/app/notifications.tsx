import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Txt } from '@/components/ui';
import { t } from '@/lib/i18n';
import { colors, font, radius, spacing, rtlRow } from '@/lib/theme';
import {
  useNotifications,
  timeAgoForNotif,
  type AppNotification,
} from '@/lib/notifications';

type FeatherName = keyof typeof Feather.glyphMap;

const TYPE_META: Record<string, { icon: FeatherName; tint: string }> = {
  event_new: { icon: 'plus-circle', tint: colors.maroon },
  event_upcoming: { icon: 'calendar', tint: colors.gold },
  profile_incomplete: { icon: 'alert-circle', tint: colors.gold },
  registration: { icon: 'check-circle', tint: colors.green },
  welcome: { icon: 'heart', tint: colors.maroon },
};

function NotifItem({
  item,
  onPress,
  onRemove,
}: {
  item: AppNotification;
  onPress: () => void;
  onRemove: () => void;
}) {
  const meta = TYPE_META[item.type] ?? TYPE_META.welcome;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.92 }, !item.read && styles.itemUnread]}
    >
      <View style={[styles.itemIcon, { backgroundColor: meta.tint + '18' }]}>
        <Feather name={meta.icon} size={18} color={meta.tint} />
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemHeader}>
          <Txt style={styles.itemTitle}>{item.title}</Txt>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>
        <Txt type="small" numberOfLines={3}>{item.body}</Txt>
        <Txt style={styles.itemTime}>{timeAgoForNotif(item)}</Txt>
      </View>
      <Pressable hitSlop={12} onPress={onRemove} style={styles.removeBtn}>
        <Feather name="x" size={16} color={colors.ink3} />
      </Pressable>
    </Pressable>
  );
}

export default function Notifications() {
  const { notifications, unreadCount, isLoading, markAllRead, markRead, remove, clearAll } = useNotifications();

  function onItemPress(n: AppNotification) {
    markRead(n.id);
    if (n.href) {
      router.push(n.href as any);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Feather name="chevron-right" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Txt type="h2">{t.notificationsTitle}</Txt>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Txt style={styles.badgeText}>{unreadCount}</Txt>
            </View>
          ) : null}
        </View>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.maroon} size="large" />
        </View>
      ) : notifications.length > 0 ? (
        <>
          <View style={styles.actionsRow}>
            <Pressable hitSlop={8} onPress={markAllRead} style={styles.actionBtn}>
              <Feather name="check" size={14} color={colors.maroon} />
              <Txt style={styles.actionText}>{t.notificationsMarkRead}</Txt>
            </Pressable>
            <Pressable hitSlop={8} onPress={clearAll} style={styles.actionBtn}>
              <Feather name="trash-2" size={14} color={colors.ink3} />
              <Txt style={[styles.actionText, { color: colors.ink3 }]}>{t.notificationsClearAll}</Txt>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {notifications.map((n) => (
              <NotifItem
                key={n.id}
                item={n}
                onPress={() => onItemPress(n)}
                onRemove={() => remove(n.id)}
              />
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Feather name="bell-off" size={32} color={colors.ink3} />
          </View>
          <Txt type="h3">{t.notificationsEmpty}</Txt>
          <Txt type="small" style={styles.emptyHint}>{t.notificationsEmptyHint}</Txt>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: rtlRow, alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  headerCenter: { flexDirection: rtlRow, alignItems: 'center', gap: 6 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: 11, fontFamily: font.bold, color: colors.white },
  actionsRow: {
    flexDirection: rtlRow,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  actionBtn: { flexDirection: rtlRow, alignItems: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 12, fontFamily: font.semibold, color: colors.maroon },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 },
  item: {
    flexDirection: rtlRow,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  itemUnread: { borderColor: colors.maroon + '30', borderWidth: 1.5 },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: { flex: 1, gap: 3 },
  itemHeader: { flexDirection: rtlRow, alignItems: 'center', gap: 6 },
  itemTitle: { fontSize: 14, fontFamily: font.semibold, color: colors.ink },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.maroon },
  itemTime: { fontSize: 10, fontFamily: font.regular, color: colors.ink3, marginTop: 2 },
  removeBtn: { padding: 4, alignSelf: 'flex-start', marginTop: 2 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: 60 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: { textAlign: 'center', maxWidth: 250 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
