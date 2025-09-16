import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import axios from "axios";
import { decryptData } from '@/lib/crypto'; // <-- 1. IMPORT the new function

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // <-- 2. DECRYPT THE PASSWORD
        const decryptedPassword = decryptData(body.password);

        if (!decryptedPassword) {
            return NextResponse.json(
                { message: 'Invalid payload. Could not decrypt password.' },
                { status: 400 } // Bad Request
            );
        }

        console.log("body" , JSON.stringify(body));

        // <-- 3. USE THE DECRYPTED PASSWORD in the call to your backend
        const backendResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
            email: body.email,
            password: decryptedPassword, // Use the decrypted password here
        });

        console.log("Response from backend:", JSON.stringify(backendResponse.data, null, 2));
        const { user, token, employee } = backendResponse.data.result;

        if (!token || !user || !user.roles) {
            return NextResponse.json(
                { message: 'Invalid credentials or malformed response from auth server.' },
                { status: 401 }
            );
        }

        const tokenCookie = serialize('access_token', token, {
            // httpOnly: true, // It's safer to enable httpOnly if you don't need to read the cookie with client-side JS
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        });

        const responsePayload = { token, user, employee };
        const response = NextResponse.json(responsePayload);
        response.headers.set('Set-Cookie', tokenCookie);

        return response;

    } catch (error: any) {
        console.error('Login API route error:', error);

        // Ensure you don't leak sensitive info in error messages
        const message = error.response?.data?.error || 'Login failed. Please try again.';
        const status = error.response?.status || 500;

        return NextResponse.json(
            { message },
            { status }
        );
    }
}