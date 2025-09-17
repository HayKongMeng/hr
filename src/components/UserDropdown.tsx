'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Spin } from 'antd';

// --- Icons ---
import { LuUser } from "react-icons/lu";
import { IoMdPower } from "react-icons/io";


import { useAuth } from '@/lib/AuthContext';
import LogoutModal from "@/components/LogoutModal";


export default function UserDropdown() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // --- Use the AuthContext for all user data ---
    const { user, employee, loading: authLoading, logout } = useAuth();
    const userName = user?.name || 'User';
    const userRole = user?.roles[0] || 'Employee';
    const employeeId = employee?.data?.id;


    // --- Click outside handler (no changes needed) ---
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        toast.success('Logging out...');
        logout();
    };

    if (authLoading) {
        return <div className="w-10 h-10 flex items-center justify-center"><Spin size="small" /></div>;
    }

    return (
        <div className=" inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 bg-light-card border border-light-border rounded-lg p-1 shadow-sm hover:bg-light-bg transition-colors duration-200"
            >
                <img
                    src={employee?.data?.image_url || "/avatar.png"}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-md object-cover"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">{userName}</span>
                    <span className="text-xs bg-accent-purple/10 text-accent-purple px-1.5 py-0.5 rounded-md font-medium">
                        {userRole}
                    </span>
                </div>
            </button>

            {open && (
                <div
                    className="absolute mt-2 w-56 bg-light-card border border-light-border rounded-xl shadow-lg z-20"
                    // Add animation for a smoother feel
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <ul className="pt-2">
                        {employeeId && (
                            <li className='px-2 py-1'>
                                <Link
                                    href={`/dashboard/list/employees/${employeeId}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-light-bg hover:text-text-primary transition-colors"
                                >
                                    <LuUser size={18} /> My Profile
                                </Link>
                            </li>
                        )}
                        <li className='px-2 py-1'>
                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <IoMdPower size={18} /> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
            <LogoutModal
                open={isLogoutModalOpen}
                onCancel={() => setIsLogoutModalOpen(false)}
                onLogout={handleLogout}
            />
        </div>
    )
}