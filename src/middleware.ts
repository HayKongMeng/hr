
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = {
    '/dashboard/admin': ['Admin'],
    '/dashboard/list/employees': ['Admin'],
    '/dashboard/dash': ['Employee', 'Admin'],
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const roleCookie = request.cookies.get('user_role')?.value;

    const { pathname } = request.nextUrl;

    if (token && pathname.startsWith('/sign-in')) {
        let roles: string[] = [];
        if (roleCookie) {
            try {
                roles = JSON.parse(roleCookie);
            } catch (e) {
                console.error("Failed to parse role cookie in middleware", e);
            }
        }

        const destination = roles.includes('Admin') ? '/dashboard/admin' : '/dashboard/dash';
        const dashboardUrl = new URL(destination, request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    if (!token && pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/sign-in', request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (token && pathname.startsWith('/dashboard')) {
        let userRoles: string[] = [];

        if (roleCookie) {
            try {
                userRoles = JSON.parse(roleCookie);
            } catch (error) {
                console.error('Failed to parse role cookie:', error);
                const loginUrl = new URL('/sign-in', request.url);
                return NextResponse.redirect(loginUrl);
            }
        }

        const requiredRoles = Object.entries(protectedRoutes).find(([route, roles]) =>
            pathname.startsWith(route)
        )?.[1];

        if (requiredRoles) {
            const hasAccess = userRoles.some(role => requiredRoles.includes(role));

            if (!hasAccess) {
                const fallbackUrl = userRoles.includes('Admin') ? '/dashboard/admin' : '/dashboard/dash';
                return NextResponse.redirect(new URL(fallbackUrl, request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/sign-in',
    ],
};