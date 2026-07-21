'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { canAccessPath, isDashboardRole } from '@/lib/permissions'
import { useAuth } from '@/lib/auth/use-dashboard-auth'

/**
 * Client-side hook to enforce dashboard permissions.
 * Redirects to dashboard home if user lacks access to the current path.
 * Should be used in client components that need permission checks.
 */
export function useDashboardPermission(pathname?: string) {
  const router = useRouter()
  const currentPathname = usePathname()
  const { user, profile } = useAuth()
  const path = pathname || currentPathname

  useEffect(() => {
    if (!path) return
    
    const checkPermission = async () => {
      // Wait for auth to be ready
      if (!user) return
      
      if (!profile) return
      
      if (!isDashboardRole(profile.role)) {
        router.push('/admin-login')
        return
      }
      
      if (profile.is_active === false) {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/admin-login')
        return
      }
      
      if (!canAccessPath(profile.role, path, profile.permissions)) {
        router.push('/dashboard/home')
        return
      }
    }
    
    checkPermission()
  }, [path, user, profile, router])
}

/**
 * Get the current dashboard user profile on the client side
 * This can be used by pages that need to read user info but don't need strict enforcement
 */
export function useDashboardProfile() {
  return useAuth()
}