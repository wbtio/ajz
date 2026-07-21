'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardUser {
  id: string
  email?: string | null
  full_name?: string | null
  role?: string | null
  avatar_url?: string | null
  permissions?: string[] | null
  is_active?: boolean
}

interface AuthContextType {
  user: DashboardUser | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser?: DashboardUser | null }) {
  const [user, setUser] = useState<DashboardUser | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)

  const fetchUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setUser(null)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, email, role, permissions, is_active, avatar_url')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({ ...authUser, ...profile } as DashboardUser)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialUser) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [initialUser])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}