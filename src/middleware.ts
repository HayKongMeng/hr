import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');

    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/sign-in', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Match paths where middleware should run
export const config = {
    matcher: ['/dashboard/:path*'], // adjust to your protected routes
};
