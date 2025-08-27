'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Note the import style

// Define the structure of your decoded token based on your example
interface DecodedToken {
    user_id: number;
    email: string;
    roles: string[];
    company_id: number;
    emp_id: number;
    exp: number;
    emp_username: string;
    emp_profile: string;
}

// Define the shape of your context
interface AuthContextType {
    user: DecodedToken | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This effect still runs on initial load to check for existing cookies
        const token = Cookies.get('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                } else {
                    Cookies.remove('access_token');
                }
            } catch (error) {
                Cookies.remove('access_token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            setUser(decoded); // <-- Manually update the user state
            Cookies.set('access_token', token, { expires: 7, path: '/' }); // Set the cookie
        } catch (error) {
            console.error("Failed to decode token on login:", error);
        }
    };

    const logout = () => {
        setUser(null);
        Cookies.remove('access_token', { path: '/' });
        // Optionally redirect here or let the component handle it
        window.location.href = '/sign-in';
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use the context
export const useAuth = () => useContext(AuthContext);