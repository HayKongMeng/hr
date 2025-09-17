import { NextResponse } from 'next/server';
import { decryptData } from '@/lib/crypto';
import api from '@/lib/api';
import {cookies} from "next/headers"; // Your backend axios instance

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = cookies();
        const token = cookieStore.get("access_token")?.value;
        const decryptedPassword = decryptData(body.password);

        if (!decryptedPassword) {
            return NextResponse.json({ message: 'Invalid password payload.' }, { status: 400 });
        }

        // 2. Prepare the payload for the actual backend
        const backendPayload = {
            name: body.name,
            email: body.email,
            password: decryptedPassword,
        };
        const backendResponse = await api.post('/api/auth/register-employee', backendPayload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            );
        return NextResponse.json(backendResponse.data, { status: backendResponse.status });

    } catch (error: any) {
        console.log("This is respon");
        console.error('API route /api/auth/register error:', error.response?.data || error.message);
        return NextResponse.json(
            { message: error.response?.data?.message || 'Failed to register employee auth.' },
            { status: error.response?.status || 500 }
        );
    }
}