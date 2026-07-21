import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { canAccessPath, isDashboardRole } from '@/lib/permissions';

interface DashboardProfile {
  id: string;
  role: string | null;
  permissions: string[] | null;
  is_active?: boolean;
  full_name: string | null;
  email: string;
}

async function loadDashboardProfile(): Promise<DashboardProfile | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, role, permissions, is_active')
    .eq('id', user.id)
    .single();

  if (!profile) return null;
  if (!isDashboardRole(profile.role)) return null;
  if (profile.is_active === false) return null;

  return profile;
}

/**
 * Server-side permission guard for dashboard pages.
 * Redirects to dashboard home if user lacks access to the given path.
 */
export async function requireDashboardAccess(pathname: string): Promise<DashboardProfile> {
  const profile = await loadDashboardProfile();
  
  if (!profile) {
    redirect('/admin-login');
  }

  if (!canAccessPath(profile.role, pathname, profile.permissions)) {
    redirect('/dashboard/home');
  }

  return profile;
}