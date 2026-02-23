import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // تحديد المسارات التي تتطلب التحقق من المستخدم
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname === '/admin-login'

  // تحسين الأداء: عدم استدعاء getUser إلا إذا كان المسار يتطلب حماية أو منطق توجيه
  if (isProtectedPath) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // حماية صفحات لوحة التحكم (Dashboard)
    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        console.log('Middleware: No user found, redirecting to /admin-login')
        const url = request.nextUrl.clone()
        url.pathname = '/admin-login'
        return NextResponse.redirect(url)
      }

      // التحقق من صلاحية الأدمن
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        console.log('Middleware: User is not admin, redirecting to home')
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }

    // منع المستخدم المسجل كأدمن من دخول صفحة تسجيل الدخول مرة أخرى
    if (pathname === '/admin-login' && user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role === 'admin') {
        console.log('Middleware: Admin already logged in, redirecting to /dashboard/home')
        return NextResponse.redirect(new URL('/dashboard/home', request.url))
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
