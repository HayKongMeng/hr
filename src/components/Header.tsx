'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { FiMenu } from 'react-icons/fi';
import { MdLogout, MdNotifications, MdSettings } from 'react-icons/md';
import { CgMenuLeft } from 'react-icons/cg';
import { toast } from 'sonner';

interface HeaderProps {
    toggleMobileMenu: () => void;  // For mobile sidebar
    toggleDesktopCollapse: () => void; // For desktop sidebar
    isDesktopCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu, toggleDesktopCollapse, isDesktopCollapsed }) => {
    const { user, logout } = useAuth();
    const userRole = user?.roles?.[0];

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
    };

    return (
        <header className="flex items-center justify-between h-16 px-4 bg-white shadow-sm z-30 shrink-0">
            {/* --- Left Side --- */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button (Hamburger) */}
                <button onClick={toggleMobileMenu} className="p-2 md:hidden">
                    <FiMenu size={24} className="text-gray-600" />
                </button>

                {/* Desktop Collapse Button */}
                <button onClick={toggleDesktopCollapse} className="hidden md:block p-2">
                    <CgMenuLeft size={24} className={`text-gray-600 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* --- Right Side --- */}
            <div className="flex items-center gap-4">
                <button className="p-2 relative">
                    <MdNotifications size={24} className="text-gray-600" />
                    <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">2</span>
          </span>
                </button>
                <button className="p-2">
                    <MdSettings size={24} className="text-gray-600" />
                </button>
                <div className="flex items-center gap-2">
                    <Image
                        src={user?.emp_profile || '/avatar.png'}
                        alt="User Profile"
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                    />
                    <div className="hidden sm:block">
                        <p className="font-semibold text-gray-800 text-sm">{user?.emp_username || 'User'}</p>
                        <p className="text-xs text-gray-500">{userRole}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;