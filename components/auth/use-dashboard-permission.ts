'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardUser } from './use-dashboard-user'

/**
 * Client-side permission check hook for dashboard pages.
 * Redirects to dashboard home if user doesn't have access to the given path.
 * 
 * Usage:
 * - Place at the top level of a client component page (before any returns)
 * - Example: useDashboardPermission('/dashboard/partners')
 */
export function useDashboardPermission(pathname: string) {
  const router = useRouter()
  const { user } = useDashboardUser()

  useEffect(() => {
    if (!user) {
      router.push('/admin-login')
      return
    }

    // Admin has access to everything
    if (user.role === 'admin') return

    // Check if user is a team member with permissions
    if (user.role !== 'team') {
      router.push('/dashboard/home')
      return
    }

    const allowed = user.permissions && user.permissions.length > 0 
      ? user.permissions 
      : ['/dashboard/team-tasks']

    const path = pathname.toLowerCase()
    const hasAccess = allowed.some((p) => 
      path === p.toLowerCase() || path.startsWith(p.toLowerCase() + '/')
    )

    if (!hasAccess) {
      router.push('/dashboard/home')
    }
  }, [pathname, user, router])
}