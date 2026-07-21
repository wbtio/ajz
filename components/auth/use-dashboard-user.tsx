'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardUser {
  id: string
  email: string
  full_name: string | null
  role: string | null
  avatar_url: string | null
  permissions: string[] | null
  is_active: boolean
}

interface DashboardUserContextType {
  user: DashboardUser | null
  loading: boolean
}

const DashboardUserContext = createContext<DashboardUserContextType>({
  user: null,
  loading: true,
})

export function DashboardUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchUser = async () => {
      try {
        const supabase = createClient()
        
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('id, full_name, email, role, permissions, is_active, avatar_url')
          .eq('id', authUser.id)
          .single()

        if (mounted) {
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              permissions: profile.permissions,
              is_active: profile.is_active,
              avatar_url: profile.avatar_url,
            })
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching dashboard user:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <DashboardUserContext.Provider value={{ user, loading }}>
      {children}
    </DashboardUserContext.Provider>
  )
}

export function useDashboardUser(): DashboardUserContextType {
  const context = useContext(DashboardUserContext)
  if (!context) {
    throw new Error('useDashboardUser must be used within a DashboardUserProvider')
  }
  return context
}