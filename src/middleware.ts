import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import type { UserRole } from '@/types/auth'

const PUBLIC_ROUTES = ['/login', '/cadastro', '/auth/callback', '/auth/recover', '/auth/reset-password']

const ROLE_ROUTES: Record<UserRole, string[]> = {
  student: ['/dashboard', '/loja', '/historico', '/vouchers'],
  teacher: ['/professor'],
  admin: ['/admin'],
}

const ROLE_HOME: Record<UserRole, string> = {
  student: '/dashboard',
  teacher: '/professor',
  admin: '/admin',
}

function getRoleFromJWT(accessToken: string): UserRole {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    return payload.user_role || 'student'
  } catch {
    return 'student'
  }
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

function getRouteRole(pathname: string): UserRole | null {
  for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
    if (routes.some((route) => pathname.startsWith(route))) {
      return role as UserRole
    }
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes — they handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const { user, response, supabase } = await updateSession(request)

  // If Supabase is not configured, allow all routes (show login page)
  if (!supabase) {
    if (isPublicRoute(pathname) || pathname === '/') {
      return response
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Allow public routes for unauthenticated users
  if (!user) {
    if (isPublicRoute(pathname) || pathname === '/') {
      return response
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // User is authenticated — get role from session
  const { data: { session } } = await supabase.auth.getSession()
  const role = session?.access_token
    ? getRoleFromJWT(session.access_token)
    : 'student'

  const home = ROLE_HOME[role]

  // Redirect authenticated users away from public/login routes
  if (isPublicRoute(pathname) || pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }

  // Check if user has access to this route group
  const routeRole = getRouteRole(pathname)
  if (routeRole && routeRole !== role && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
