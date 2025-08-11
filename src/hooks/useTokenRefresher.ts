import { useEffect, useRef } from 'react';
import api from '@/lib/api/index'; // adjust path if needed

export default function useTokenRefresher(intervalMinutes = 55) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // useEffect(() => {
    //     const refreshToken = async () => {
    //         try {
    //             await api.post('/auth/refresh-token');
    //             console.log('🔁 Token refreshed');
    //         } catch (error) {
    //             console.error('❌ Token refresh failed:', error);
    //             // Optional: Redirect to login if refresh fails
    //             window.location.href = '/sign-in';
    //         }
    //     };

    //     // Refresh once immediately
    //     refreshToken();

    //     // Refresh token every X minutes
    //     intervalRef.current = setInterval(refreshToken, intervalMinutes * 60 * 1000);

    //     // Cleanup
    //     return () => {
    //         if (intervalRef.current) clearInterval(intervalRef.current);
    //     };
    // }, [intervalMinutes]);
}
