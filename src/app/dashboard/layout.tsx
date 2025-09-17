
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
import LogoutModal from "@/components/LogoutModal";
import {TabsProps} from "antd";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const toggleCollapsed = () => setCollapsed((prev) => !prev);
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    const closeMenu = () => setIsMenuOpen(false);
    const [isNotiModalOpen, setIsNotiModalOpen] = useState(false);
    const { user, logout } = useAuth();
    // Corrected role check
    const userRole = user?.roles?.[0];

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
    };
    const notificationList = [
        { id: 1, avatar: "/avatar.png", name: "Srey Mom", message: "approved your leave request.", time: "2 min ago" },
        { id: 2, avatar: "/avatar.png", name: "John Smith", message: "commented on your attendance.", time: "10 min ago" },
    ];
    const items: TabsProps["items"] = [ { key: "1", label: "All", children: ( <div className="space-y-4"> {notificationList.map((noti) => ( <div key={noti.id} className="flex gap-3 bg-blue-100 p-3 rounded-lg"> <img src={noti.avatar} alt={noti.name} className="w-10 h-10 rounded-full"/> <div className="flex-1"> <p className="font-semibold text-gray-800">{noti.name}</p> <p className="text-xs text-gray-500">{noti.time}</p> </div> <p className="text-sm text-gray-600 self-center">{noti.message}</p> </div> ))} </div> ) }, { key: "2", label: "Attendance", children: "Content for Attendance" }, { key: "3", label: "Leave", children: "Content for Leave" }, ];
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
                <div className="flex flex-col h-full z-100">
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
                            onClick={() => setIsLogoutModalOpen(true)}
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
                    <Navbar
                        toggleCollapsed={toggleCollapsed}
                        collapsed={collapsed}
                        toggleMenu={toggleMenu}
                        onNotificationClick={() => setIsNotiModalOpen(true)}
                    />
                </div>

                {/* Mobile Navbar */}
                <div className="block md:hidden">
                    {/*<MobileNavbar toggleMenu={toggleMenu} />*/}
                    <Navbar
                        toggleCollapsed={toggleCollapsed}
                        collapsed={collapsed}
                        toggleMenu={toggleMenu}
                        onNotificationClick={() => setIsNotiModalOpen(true)}
                    />
                </div>

                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>


            </div>
            {/* Mobile Footer Menu */}
            {MobileFooterMenu && (
                <div className="block md:hidden mt-10 z-0">
                    <MobileFooterMenu />
                </div>
            )}

            <LogoutModal
                open={isLogoutModalOpen}
                onCancel={() => setIsLogoutModalOpen(false)}
                onLogout={handleLogout}
            />
        </div>
    );
}