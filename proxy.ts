import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canAccessPath, isDashboardRole, defaultRouteForRole } from '@/lib/permissions'

export async function proxy(request: NextRequest) {
  // استثناء طلبات Server Actions
  if (request.headers.get('Next-Action')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname.toLowerCase()

  // This deployment is an internal dashboard. Public marketing pages are not
  // exposed, while the dashboard, auth flow, and API remain available.
  const isDashboardPath = pathname.startsWith('/dashboard')
  const isAdminLoginPath = pathname === '/admin-login'
  const isAuthPath = pathname.startsWith('/auth')
  const isApiPath = pathname.startsWith('/api')

  if (!isDashboardPath && !isAdminLoginPath && !isAuthPath && !isApiPath) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // تحديد المسارات التي تتطلب التحقق من المستخدم
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname === '/admin-login' ||
    pathname.startsWith('/api')

  // تحسين الأداء: عدم استدعاء getUser إلا إذا كان المسار يتطلب حماية أو منطق توجيه
  if (isProtectedPath) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // حماية صفحات لوحة التحكم (Dashboard) حسب دور المستخدم
    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        console.log('Middleware: No user found, redirecting to /admin-login')
        const url = request.nextUrl.clone()
        url.pathname = '/admin-login'
        return NextResponse.redirect(url)
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role, permissions')
        .eq('id', user.id)
        .single()

      const role = profile?.role
      const permissions = profile?.permissions

      // دور غير معروف → خارج لوحة التحكم
      if (!isDashboardRole(role)) {
        console.log('Middleware: Not a dashboard role, redirecting to home')
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      // صفحة "الفريق" الإدارية للمدير فقط، بغض النظر عن أي صلاحيات مُسندة
      // (مطابقة دقيقة كي لا يتصادم المسار مع "/dashboard/team-tasks")
      if ((pathname === '/dashboard/team' || pathname.startsWith('/dashboard/team/')) && role !== 'admin') {
        return NextResponse.redirect(new URL(defaultRouteForRole(role, permissions), request.url))
      }

      // دور معروف لكن المسار غير مسموح له → صفحته الافتراضية
      if (!canAccessPath(role, pathname, permissions)) {
        console.log(`Middleware: Role "${role}" cannot access ${pathname}`)
        return NextResponse.redirect(new URL(defaultRouteForRole(role, permissions), request.url))
      }
    }

    // منع المستخدم المسجّل من دخول صفحة تسجيل الدخول مرة أخرى
    if (pathname === '/admin-login' && user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (isDashboardRole(profile?.role)) {
        return NextResponse.redirect(
          new URL(defaultRouteForRole(profile?.role), request.url)
        )
      }
    }

  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
