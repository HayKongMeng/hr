// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode'; // <-- Import the decoder

// Define the structure of your JWT payload to help TypeScript
interface UserJwtPayload {
    roles: string[];
    // Add other properties from your token if needed
}

const protectedRoutes = {
    '/dashboard/admin': ['Admin'],
    '/dashboard/list/users': ['Admin'],
    '/dashboard/list/roles': ['Admin'],
    '/dashboard/dash': ['Employee', 'Admin'],
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
        } catch (error) {
            console.error("Invalid token, cannot decode:", error);
            // If token is malformed, treat it as if there's no token
        }
    }

    // Rule 1: Handle authenticated user trying to access sign-in page
    if (token && pathname.startsWith('/sign-in')) {
        const destination = userRoles.includes('Admin') ? '/dashboard/admin' : '/dashboard/dash';
        return NextResponse.redirect(new URL(destination, request.url));
    }

    // Rule 2: Handle unauthenticated user trying to access protected routes
    // (Check token instead of userRoles.length to handle cases where a token exists but has no roles)
    if (!token && pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/sign-in', request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 3: Handle role-based authorization for authenticated users
    if (token && pathname.startsWith('/dashboard')) {
        // Find the route definition that the current path starts with
        const routeConfig = Object.entries(protectedRoutes).find(([route, _]) =>
            pathname.startsWith(route)
        );

        if (routeConfig) {
            const requiredRoles = routeConfig[1];
            // Check if the user has any of the required roles
            const hasAccess = userRoles.some(role => requiredRoles.includes(role));

            if (!hasAccess) {
                // Determine the user's correct "home" page
                const fallbackUrl = userRoles.includes('Admin') ? '/dashboard/admin' : '/dashboard/dash';

                // Prevent redirect loop by checking if we are already at the destination
                if (pathname !== fallbackUrl) {
                    return NextResponse.redirect(new URL(fallbackUrl, request.url));
                }
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