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

        const roleCookie = serialize('user_role', JSON.stringify(user.roles), {
            // httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        const employeeIdCookie = serialize('employee_id', JSON.stringify(employee.data.id), {
            // httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        const userIdCookie = serialize('user_id', JSON.stringify(user.id), {
            // httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        const userNameCookie = serialize('user_name', JSON.stringify(user.name), {
            // httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        const companyIdCookie = serialize('company_id', JSON.stringify(employee.data.company_id), {
            // httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        const responsePayload = {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                roles: user.roles,
            },
            employee: employee?.data ? {
                id: employee.data.id,
                company_id: employee.data.company_id,
            } : null,
        };

        const response = NextResponse.json(responsePayload);

        response.headers.append('Set-Cookie', tokenCookie);
        response.headers.append('Set-Cookie', roleCookie);
        response.headers.append('Set-Cookie', employeeIdCookie);
        response.headers.append('Set-Cookie', userIdCookie);
        response.headers.append('Set-Cookie', userNameCookie);
        response.headers.append('Set-Cookie', companyIdCookie);


        return response;

    } catch (error: any) {
        console.error('Login API route error:', error);
        return NextResponse.json(
            { message: error.response?.data?.error || 'Login failed.' },
            { status: error.response?.status || 500 }
        );
    }
}