import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SPEC - Global Middleware
 * This middleware handles:
 * 1. Security Headers
 * 2. Request Logging (Traceability)
 * 3. Protected Route Pre-checks (Ready for Auth Integration)
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Request Logging for Audit Compliance
    // In a production environment, this should log to a centralized service like Axiom or Datadog
    console.log(`[SPEC-MIDDLEWARE] Request: ${request.method} ${pathname} at ${new Date().toISOString()}`);

    // 2. Security Headers
    const response = NextResponse.next();

    // Prevent Clickjacking
    response.headers.set('X-Frame-Options', 'DENY');
    // XSS Protection
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 3. Protected Route Logic (Placeholder for SSO/Auth integration)
    // For example, if we want to protect all dashboard routes:
    // if (pathname.startsWith('/dashboard') || pathname.startsWith('/master')) {
    //   const token = request.cookies.get('auth-token');
    //   if (!token) {
    //     return NextResponse.redirect(new URL('/login', request.url));
    //   }
    // }

    return response;
}

// Config to specify which routes this middleware should run on
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
};
