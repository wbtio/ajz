/**
 * سياق الإشعارات — مربوط بالكامل بجدول notifications في قاعدة بيانات Supabase.
 * يقرأ، يعلّم كمقروء، يحذف، ويولّد إشعارات ذكية من بيانات حقيقية (فعاليات، ملف شخصي).
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from './supabase';
import { useAuth } from './auth';
import { useEvents, eventTitle, type EventRow } from './events';
import { useProfile, useSectors, sectorName } from './sectors';

export type NotificationType = 'event_new' | 'event_upcoming' | 'profile_incomplete' | 'registration' | 'welcome';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

type NotificationState = {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAllRead: () => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationState | undefined>(undefined);

const QUERY_KEY = 'notifications';

/** يحدد مسار التنقل حسب نوع الإشعار ومحتواه */
function hrefForType(type: string, body: string): string | undefined {
  if (type === 'profile_incomplete') return '/profile-setup';
  if (type === 'welcome') return '/(tabs)/events';
  if (type === 'event_new' || type === 'event_upcoming') {
    const match = body.match(/event\/([a-f0-9-]+)/i);
    if (match) return `/event/${match[1]}`;
  }
  if (type === 'registration') return '/(tabs)/ticket';
  return undefined;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `قبل ${days} ${days === 1 ? 'يوم' : 'يوماً'}`;
  if (hrs > 0) return `قبل ${hrs} ${hrs === 1 ? 'ساعة' : 'ساعتين'}`;
  if (mins > 0) return `قبل ${mins} دقيقة`;
  return 'الآن';
}

export function timeAgoForNotif(n: AppNotification): string {
  return timeAgo(n.createdAt);
}

async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body ?? '',
    createdAt: row.created_at,
    read: row.is_read,
    href: row.link_url || hrefForType(row.type, row.body ?? ''),
  }));
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: events = [] } = useEvents();
  const { data: profile } = useProfile();
  const { data: sectors = [] } = useSectors();
  const queryClient = useQueryClient();
  const [seeded, setSeeded] = useState(false);

  const { data: notifications = [], isLoading } = useQuery<AppNotification[]>({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user?.id,
  });

  /**
   * يولّد إشعارات ذكية من بيانات حقيقية (مرة واحدة لكل نوع طوال عمر الحساب).
   * نتتبّع الأنواع المولَّدة سابقاً في users.notified_types بدل الاعتماد على وجود
   * صف الإشعار نفسه — لأن المستخدم قد يحذف الإشعار، وحذفه لا يعني أننا نريد
   * توليده من جديد (كان سابقاً يعيد الظهور بعد الحذف بسبب هذا الخلط).
   */
  useEffect(() => {
    if (!user?.id || events.length === 0 || seeded) return;

    async function seed() {
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('notified_types')
        .eq('id', user!.id)
        .single();
      if (userError) return;
      const notifiedTypes = new Set(userRow?.notified_types ?? []);

      const toInsert: { user_id: string; type: string; title: string; body: string | null; link_url?: string }[] = [];

      if (!notifiedTypes.has('welcome')) {
        toInsert.push({
          user_id: user!.id,
          type: 'welcome',
          title: 'أهلاً بك في JAZ',
          body: 'بوّابتك للفعاليات الدولية — استكشف الفعاليات وسجّل في ما يناسبك',
        });
      }

      if (profile && !profile.preferred_sector_id && !notifiedTypes.has('profile_incomplete')) {
        toInsert.push({
          user_id: user!.id,
          type: 'profile_incomplete',
          title: 'أكمل ملفك الشخصي',
          body: 'أكمل ملفك الشخصي لنرشّح لك الفعاليات المناسبة لتخصصك',
        });
      }

      if (profile?.preferred_sector_id && sectors && sectors.length > 0) {
        const mySector = sectors.find((s) => s.id === profile.preferred_sector_id);
        const sectorEvents = events.filter((e) => e.sector_id === profile.preferred_sector_id);
        if (sectorEvents.length > 0 && mySector && !notifiedTypes.has('event_new')) {
          toInsert.push({
            user_id: user!.id,
            type: 'event_new',
            title: 'فعالية جديدة في قطاعك',
            body: `تمت إضافة "${eventTitle(sectorEvents[0])}" في قطاع ${sectorName(mySector)}`,
            link_url: `/event/${sectorEvents[0].id}`,
          });
        }
      }

      const now = Date.now();
      const upcoming = events.find((e) => {
        if (!e.date) return false;
        const diff = new Date(e.date).getTime() - now;
        return diff > 0 && diff < 7 * 86400000;
      });
      if (upcoming && !notifiedTypes.has('event_upcoming')) {
        const days = Math.ceil((new Date(upcoming.date).getTime() - now) / 86400000);
        toInsert.push({
          user_id: user!.id,
          type: 'event_upcoming',
          title: 'فعالية خلال أيام',
          body: `"${eventTitle(upcoming)}" تبدأ خلال ${days} ${days === 1 ? 'يوم' : 'يوماً'} — استعد للمشاركة`,
          link_url: `/event/${upcoming.id}`,
        });
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('notifications').insert(toInsert);
        if (!insertError) {
          const newTypes = [...notifiedTypes, ...toInsert.map((n) => n.type)];
          await supabase.from('users').update({ notified_types: newTypes }).eq('id', user!.id);
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
      }

      setSeeded(true);
    }

    seed();
  }, [user?.id, events, profile, sectors, seeded, queryClient]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  }, [queryClient]);

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAllRead: () => markAllRead.mutate(),
        markRead: (id: string) => markRead.mutate(id),
        remove: (id: string) => remove.mutate(id),
        clearAll: () => clearAll.mutate(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
