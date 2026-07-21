import { createClient } from '@/lib/supabase/server';
import { canAccessPath, isDashboardRole } from './permissions';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, permissions, is_active')
    .eq('id', user.id)
    .single();

  return profile ? { ...user, ...profile } : null;
}

export async function requireDashboardAccess(pathname: string) {
  const user = await getCurrentUser();

  if (!user || !isDashboardRole(user.role)) {
    redirect('/admin-login');
  }

  if (user.is_active === false) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/admin-login');
  }

  if (!canAccessPath(user.role, pathname, user.permissions)) {
    redirect('/dashboard/home');
  }

  return user;
}