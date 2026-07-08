/**
 * سياق المصادقة — يوفّر الجلسة والمستخدم لكل التطبيق،
 * مع الدخول، إنشاء حساب، والخروج (عبر Supabase Auth).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from './supabase';

type Result = { error: string | null };

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (
    fullName: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<Result & { needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;
    supabase.auth.getSession().then(({ data }) => {
      settled = true;
      setSession(data.session);
      setLoading(false);
    });
    // شبكة معلّقة يجب ألا تحبس المستخدم على شاشة تحميل إلى الأبد
    const timeout = setTimeout(() => {
      if (!settled) setLoading(false);
    }, 8000);
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<Result> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }

  async function signUp(fullName: string, email: string, phone: string, password: string) {
    // مطابق لتسجيل الموقع: نمرّر الاسم والهاتف في الـ metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) return { error: error.message };
    // إذا لم تُنشأ جلسة مباشرة فهذا يعني أن التأكيد عبر البريد مفعّل
    const needsConfirm = !data.session;
    return { error: null, needsConfirm };
  }

  async function signOut() {
    await supabase.auth.signOut();
    // لا ننتظر onAuthStateChange كي لا تظهر بيانات المستخدم القديمة للحظة بعد الخروج
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
