
'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import Menu from '@/components/Menu';
import Navbar from '@/components/Navbar';
import MobileNavbar from '@/components/mobile/MobileNavbar';
import EmpMobileMenu from '@/components/mobile/employee/EmpMobileMenu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    
    // Using a placeholder role. Replace with your actual auth context.
    const { role } = typeof window !== 'undefined' ? { role: localStorage.getItem('user_role') } : { role: null };
    
    const toggleCollapsed = () => setCollapsed((prev) => !prev);
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    const closeMenu = () => setIsMenuOpen(false);

    // Conditionally render the mobile footer menu
    const MobileFooterMenu = role === 'Admin' || 'Employee' ? EmpMobileMenu : null; // or MobileMenu if you have one for admins

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
                <div className="hidden md:block">
                    <Navbar toggleCollapsed={toggleCollapsed} collapsed={collapsed} />
                </div>

                {/* Mobile Navbar */}
                <div className="block md:hidden">
                    <MobileNavbar toggleMenu={toggleMenu} />
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