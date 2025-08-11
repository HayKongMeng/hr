'use client';
import useTokenRefresher from '@/hooks/useTokenRefresher';

export default function TokenRefresher() {
    useTokenRefresher(); // 55 minutes default
    return null; // no UI, just logic
}
