'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import Menu from '@/components/Menu';
import Navbar from '@/components/Navbar';
// import TokenRefresher from '@/components/TokenRefresher';
import MobileNavbar from '@/components/mobile/MobileNavbar';
import MobileMenu from '@/components/mobile/MobileMenu';
import EmpMobileMenu from '@/components/mobile/employee/EmpMobileMenu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    return (
        <div>
            <div className="h-screen w-full flex overflow-hidden relative">
                {/* <TokenRefresher /> */}

                {/* Sidebar */}
                <div
                    className={clsx(
                    'fixed z-50 top-0 left-0 h-full w-[255px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto',
                    {
                        'translate-x-0': isMenuOpen,
                        '-translate-x-full': !isMenuOpen,
                        'md:translate-x-0 md:static md:shadow-none': true, // always show on desktop
                    }
                    )}
                >
                    <div className="p-2">
                        <Link href="/" className="flex items-center justify-center gap-2 p-4 pl-2">
                            <Image src="/logos.png" alt="logo" width={130} height={130} />
                        </Link>
                        {/* Desktop Navbar - visible on md and above */}
                        <div className="hidden md:block">
                            <Menu />
                        </div>
                        
                    </div>
                </div>

                {/* Overlay for mobile */}
                {isMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Desktop Navbar - visible on md and above */}
                    <div className="hidden md:block">
                        <Navbar toggleMenu={toggleMenu} />
                    </div>

                    {/* Mobile Navbar - visible below md */}
                    <div className="block md:hidden">
                        <MobileNavbar />
                    </div>
                    <main 
                    className="
                    flex-1
                    overflow-y-auto
                    p-4
                    "
                    >
                        {children}
                    </main>
                   <div className="block md:hidden">
                        <EmpMobileMenu />
                        {/* <MobileMenu /> */}
                    </div>
                </div>
                 
            </div>
            
        </div>
    );
}
