import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import axios from "axios";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("body" , JSON.stringify(body));
        const backendResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
            email: body.email,
            password: body.password,
        });
        console.log("Response from backend:", JSON.stringify(backendResponse.data, null, 2));
        const { user, token, employee } = backendResponse.data.result;

        if (!token || !user || !user.roles) {
            return NextResponse.json(
                { message: 'Invalid credentials or malformed response from auth server.' },
                { status: 401 }
            );
        }

        const isProduction = process.env.NODE_ENV === 'production';

        const tokenCookie = serialize('access_token', token, {
            // httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        const responsePayload = { token, user, employee };
        const response = NextResponse.json(responsePayload);
        response.headers.set('Set-Cookie', tokenCookie);


        return response;

    } catch (error: any) {
        console.error('Login API route error:', error);
        return NextResponse.json(
            { message: error.response?.data?.error || 'Login failed.' },
            { status: error.response?.status || 500 }
        );
    }
}