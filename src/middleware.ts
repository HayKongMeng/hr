import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import {toast} from "sonner";

interface UserJwtPayload {
    roles: string[];
}

const protectedRoutes = {
    '/dashboard/list/companies' : ['Admin', 'Super Admin'],
    '/dashboard/list/designations' : ['Admin', 'Super Admin'],
    '/dashboard/list/leave-type': ['Admin', 'Super Admin'],
    '/dashboard/list/working-station': ['Admin', 'Super Admin'],
    '/dashboard/list/employment-type': ['Admin', 'Super Admin'],
    '/dashboard/list/nationalities': ['Admin', 'Super Admin'],
    '/dashboard/list/matrial-status': ['Admin', 'Super Admin'],
    '/dashboard/admin': ['Admin', 'Super Admin'],
    '/dashboard/list/users': ['Admin', 'Super Admin'],
    '/dashboard/list/roles': ['Admin', 'Super Admin'],
    '/dashboard/dash': ['Employee', 'Admin', 'Super Admin'],
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    let userRoles: string[] = [];

    // --- Decode the token once at the top ---
    if (token) {
        try {
            const decoded = jwtDecode<UserJwtPayload>(token);
            userRoles = decoded.roles || [];
        } catch (error: any) {
            toast.error("Invalid token, cannot decode:", error);
        }
    }

    if (token && pathname.startsWith('/sign-in')) {
        const destination = userRoles.includes('Admin') ? '/dashboard/admin' : '/dashboard/dash';
        return NextResponse.redirect(new URL(destination, request.url));
    }

    if (!token && pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/sign-in', request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && pathname.startsWith('/dashboard')) {
        const routeConfig = Object.entries(protectedRoutes).find(([route, _]) =>
            pathname.startsWith(route)
        );

        if (routeConfig) {
            const requiredRoles = routeConfig[1];
            const hasAccess = userRoles.some(role => requiredRoles.includes(role));

            if (!hasAccess) {
                const notFoundUrl = new URL('/_i-do-not-exist', request.url);
                return NextResponse.rewrite(notFoundUrl);
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