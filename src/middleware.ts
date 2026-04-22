import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = 'secret'; // Must match lib/auth.ts
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Request Logging
    console.log(`[SPEC-MIDDLEWARE] Request: ${request.method} ${pathname} at ${new Date().toISOString()}`);

    // 2. Secret and Cookie Check
    const sessionCookie = request.cookies.get('session')?.value;

    // Define public routes
    const isPublicRoute = ['/login', '/admin-signup'].includes(pathname);
    const isStaticFile = pathname.startsWith('/_next') ||
        pathname.includes('/favicon.ico') ||
        pathname.includes('.png') ||
        pathname.includes('.jpg');

    if (isStaticFile) return NextResponse.next();

    let session = null;
    if (sessionCookie) {
        try {
            const { payload } = await jwtVerify(sessionCookie, key);
            session = payload as any;
        } catch (error) {
            console.error('Middleware session error:', error);
        }
    }

    // Redirect to login if not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Handle authenticated users
    if (session) {
        const user = session.user;

        // 1. Prevent Workers from accessing Admin routes
        if (user.role === 'worker' && pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // 2. Handle restricted pages for Workers
        if (user.role === 'worker') {
            const isRestricted = user.restrictedPages?.some((p: string) => pathname.startsWith(p));
            if (isRestricted) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        // 3. Redirect authenticated users away from Login/Signup
        if (isPublicRoute) {
            const redirectUrl = user.role === 'admin' ? '/admin/workers' : '/dashboard';
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
    }

    // 4. Security Headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    ],
};
