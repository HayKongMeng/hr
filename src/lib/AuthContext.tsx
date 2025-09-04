"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode, JwtPayload } from 'jwt-decode';

// Define the shape of your user and employee objects based on your API response
interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface Employee {
    data: {
        id: number;
        name: string;
        company_id: number;
        scan_code: string | null;
        image_url: string | null;
    };
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    employee: Employee | null;
    login: (data: { token: string; user: User; employee: Employee }) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('access_token');
        const storedUser = localStorage.getItem('user');
        const storedEmployee = localStorage.getItem('employee');

        if (token && storedUser && storedEmployee) {
            try {
                // You can add token validation/decoding here if needed
                setUser(JSON.parse(storedUser));
                setEmployee(JSON.parse(storedEmployee));
            } catch (error) {
                console.error("Failed to parse stored auth data", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (data: { token: string; user: User; employee: Employee }) => {
        Cookies.set('access_token', data.token, { expires: 7, path: '/' });
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('employee', JSON.stringify(data.employee));
        setUser(data.user);
        setEmployee(data.employee);
    };

    const logout = () => {
        Cookies.remove('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('employee');
        setUser(null);
        setEmployee(null);
        // You might want to redirect to login page here
        window.location.href = '/';
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, employee, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};