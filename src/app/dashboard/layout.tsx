
'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import Menu from '@/components/Menu';
import Navbar from '@/components/Navbar';
import MobileNavbar from '@/components/mobile/MobileNavbar';
import EmpMobileMenu from '@/components/mobile/employee/EmpMobileMenu';
import {MdLogout} from "react-icons/md";
import {toast} from "sonner";
import {useAuth} from "@/lib/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);


    const toggleCollapsed = () => setCollapsed((prev) => !prev);
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    const closeMenu = () => setIsMenuOpen(false);

    const { user, logout } = useAuth();
    // Corrected role check
    const userRole = user?.roles?.[0];

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
    };

    // Conditionally render the mobile footer menu
    const MobileFooterMenu = userRole === 'Admin' || 'Employee' ? EmpMobileMenu : null;

    return (
        <div className="h-screen w-full flex overflow-hidden">
            {/* --- Sidebar --- */}
            <div
                className={clsx(
                    'fixed z-50 top-0 left-0 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out',
                    // Mobile overlay logic
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    // Desktop static and collapse logic
                    'md:relative md:translate-x-0 md:shadow-none',
                    collapsed ? 'md:w-20' : 'md:w-[255px]'
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="p-2 flex-shrink-0">
                        <Link href="/sign-in" className="flex items-center justify-center gap-2 p-4 pl-2">
                            {collapsed ? (
                                <Image src="/favicon.ico" alt="logo" width={32} height={32} />
                            ) : (
                                <Image src="/logos.png" alt="logo" width={130} height={130} />
                            )}
                        </Link>
                    </div>
                    {/* The Menu component fills the remaining space */}
                    <div className="flex-grow overflow-y-auto">
                        <Menu collapsed={collapsed} closeMenu={closeMenu} />
                    </div>

                    <div className="flex-shrink-0 p-2 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-3 rounded-lg transition text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            <MdLogout className="w-5 h-5 min-w-[20px]" />
                            {!collapsed && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
                    onClick={closeMenu}
                />
            )}

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Desktop Navbar */}
                <div className="hidden md:block z-40">
                    <Navbar toggleCollapsed={toggleCollapsed} collapsed={collapsed} />
                </div>

                {/* Mobile Navbar */}
                <div className="block md:hidden">
                    <MobileNavbar toggleMenu={toggleMenu} />
                    {/*<Navbar toggleCollapsed={toggleCollapsed} collapsed={collapsed} />*/}
                </div>

                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>

                {/* Mobile Footer Menu */}
                {MobileFooterMenu && (
                    <div className="block md:hidden mt-10">
                        <MobileFooterMenu />
                    </div>
                )}
            </div>
        </div>
    );
}