
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    try {
        return await updateSession(request)
    } catch (e) {
        console.error('Middleware failed:', e)
        // Ensure API routes return JSON on middleware failure
        if (request.nextUrl.pathname.startsWith('/api')) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Internal Server Error (Middleware)',
                    message: "Middleware check failed. Likely missing environment variables."
                }),
                { status: 500, headers: { 'content-type': 'application/json' } }
            )
        }
        // Fallback for page routes
        return NextResponse.next({ request: { headers: request.headers } })
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - widget (Widget assets)
         * - static (Static files)
         * - brand, company, status, health (Python pages)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|widget|static|brand|company|status|health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
