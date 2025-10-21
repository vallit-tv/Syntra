// Middleware for protected routes
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Get the current session
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/dashboard/analytics', '/dashboard/workflows', '/dashboard/integrations']
    const authRoutes = ['/login', '/register']

    const { pathname } = req.nextUrl

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // If user is not authenticated and trying to access protected route
    if (isProtectedRoute && !session) {
        const redirectUrl = new URL('/login', req.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access auth routes
    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
