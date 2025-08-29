'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RxDashboard } from "react-icons/rx";
import {LuQrCode, LuUsers} from "react-icons/lu";
import { TbPoint } from "react-icons/tb";
import { LuUserCog } from "react-icons/lu";
import {FiUser, FiUserPlus} from "react-icons/fi";
import {
  MdAccessTime,
  MdLogout,
  MdOutlineSpaceDashboard,
} from 'react-icons/md';

import {Menu as AntdMenu, Spin} from 'antd';
import type { IconType } from 'react-icons';
import { MenuItemType } from 'antd/es/menu/interface';
import {useAuth} from "@/lib/AuthContext";
import {FaUserCheck} from "react-icons/fa6";
import {FaTree} from "react-icons/fa";
import {GiPartyFlags} from "react-icons/gi";
import {HiOutlineBadgeCheck} from "react-icons/hi";


const api = {
    post: async (url: string) => {
        if (url === '/auth/logout') {
            return new Promise((resolve) => setTimeout(resolve, 500));
        }
        throw new Error('Unknown endpoint');
    },
};

interface MenuChildItem {
    iconComponent?: IconType;
    label: string;
    href?: string;
    visible: string[];
    children?: MenuChildItem[];
}

interface MenuItem extends Omit<MenuChildItem, 'href'> {
    iconComponent?: IconType;
    label: string;
    href?: string;
    visible: string[];
    children?: MenuChildItem[];
}
interface MenuProps {
  closeMenu: () => void;
  collapsed: boolean;
}


interface MenuSection {
    items: MenuItem[];
}





const Menu: React.FC<MenuProps> = ({ closeMenu, collapsed }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

    const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

    const userRoles = user?.roles || [];
    const employeeId = user?.emp_id;

    const getMenuItems = (empId: number | undefined): MenuSection[] => [
        {
            items: [
                {
                    iconComponent: RxDashboard,
                    label: "Dashboard",
                    visible: ["Admin", "Super Admin"],
                    children: [
                        {
                            iconComponent: TbPoint,
                            label: "Overview",
                            href: "/dashboard/admin",
                            visible: ["Admin", "Super Admin","Employee"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Report",
                            visible: ["Admin", "Super Admin"],
                            children: [
                                {
                                    iconComponent: TbPoint,
                                    label: "Monthly Attendance",
                                    href: "/dashboard/list/report/monthly/attendance",
                                    visible: ["Admin", "Super Admin"],
                                },
                                {
                                    iconComponent: TbPoint,
                                    label: "Leave",
                                    href: "/dashboard/list/report/leave",
                                    visible: ["Admin", "Super Admin"],
                                },
                            ],
                        },
                    ]
                },
                {
                    iconComponent: FiUser,
                    label: "Profile",
                    href: `/dashboard/list/employees/${employeeId}`,
                    visible: ["Admin","Employee"],
                },
                {
                    iconComponent: LuQrCode,
                    label: "Check Attendance",
                    href: "/dashboard/dash",
                    visible: ["Admin", "Super Admin", "Employee"],
                },
                {
                    iconComponent: GiPartyFlags,
                    label: "Holidays",
                    href: "/dashboard/list/holidays",
                    visible: ["Admin", "Super Admin", "Employee"],
                },
                {
                    iconComponent: LuUsers,
                    label: "Staff",
                    visible: ["Admin", "Super Admin"],
                    children: [
                        {
                            iconComponent: TbPoint,
                            label: "User",
                            href: "/dashboard/list/users",
                            visible: ["Admin", "Super Admin"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Role",
                            href: "/dashboard/list/roles",
                            visible: ["Super Admin"],
                        },
                    ],
                },
                {
                    iconComponent: FiUserPlus,
                    label: "Employee",
                    href: "/dashboard/list/employees",
                    visible: ["Admin", "Super Admin"],
                },
                {
                    iconComponent: HiOutlineBadgeCheck,
                    label: "Entitlements",
                    href: "/dashboard/list/entitlements",
                    visible: ["Admin", "Super Admin","Employee"],
                },
                {
                    iconComponent: MdAccessTime,
                    label: "Timesheet",
                    visible: ["Admin", "Super Admin"],
                    children: [
                        {
                            iconComponent: TbPoint,
                            label: "Manage Leave",
                            href: "/dashboard/list/leaves",
                            visible: ["Admin", "Super Admin", "Employee"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Attendance",
                            visible: ["Admin", "Super Admin" , "Employee"],
                            children: [
                                {
                                    iconComponent: TbPoint,
                                    label: "Marked Attendance",
                                    href: "/dashboard/list/attendance/markedattendance",
                                    visible: ["Admin", "Super Admin" , "Employee"],
                                }
                            ],
                        },
                    ],
                },
                {
                    iconComponent: MdAccessTime,
                    href: "/dashboard/list/leaves",
                    label: "Manage Leave",
                    visible: ["Employee"],
                },
                {
                    iconComponent: FaUserCheck,
                    label: "Marked Attendance",
                    href: "/dashboard/list/attendance/markedattendance",
                    visible: ["Employee"],
                },
                {
                    iconComponent: MdOutlineSpaceDashboard,
                    label: "HRM System Setup",
                    visible: ["Admin","Super Admin"],
                    children: [
                        {
                            iconComponent: TbPoint,
                            label: "Companies",
                            href: "/dashboard/list/companies",
                            visible: ["Super Admin", "Admin"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Designation",
                            href: "/dashboard/list/designations",
                            visible: ["Admin"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Leave Type",
                            href: "/dashboard/list/leave-type",
                            visible: ["Admin"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Working Station",
                            href: "/dashboard/list/working-station",
                            visible: ["Admin"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Employment Type",
                            href: "/dashboard/list/employment-type",
                            visible: ["Admin"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Nationalities",
                            href: "/dashboard/list/nationalities",
                            visible: ["Admin"],
                        },
                        {
                            iconComponent: TbPoint,
                            label: "Matrial Status",
                            href: "/dashboard/list/matrial-status",
                            visible: ["Admin"],
                        }
                    ],
                },
            ],
        },
    ];

    const menuItems = getMenuItems(employeeId);
    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
    };

    const transformMenuItems = (items: (MenuItem | MenuChildItem)[], roles: string[]): MenuItemType[] => {
        return items
            .filter(item => item.visible.some(visibleRole => roles.includes(visibleRole)))
            .map((item) => {
                const key = item.href || item.label;
                const icon = item.iconComponent ? React.createElement(item.iconComponent) : null;

                if (item.children && item.children.length > 0) {
                    const visibleChildren = transformMenuItems(item.children, roles);
                    if (visibleChildren.length === 0) return null;
                    return { key, icon, label: item.label, children: visibleChildren };
                }

                return {
                    key,
                    icon,
                    label: <Link href={item.href || '#'} onClick={closeMenu}>{item.label}</Link>,
                };
            })
            .filter(Boolean) as MenuItemType[];
    };

    const antdMenuItems = isAuthenticated ? transformMenuItems(menuItems[0].items, userRoles) : [];
    
    const getDefaultOpenKeys = () => {
        const openKeys: string[] = [];
        const findPath = (items: (MenuItem | MenuChildItem)[]) => {
            for (const item of items) {
                if (item.children) {
                    const childHasActiveLink = item.children.some(child => child.href === pathname || (child.children && child.children.some(c => c.href === pathname)));
                    if (childHasActiveLink) {
                        openKeys.push(item.href || item.label);
                        findPath(item.children); 
                    }
                }
            }
        };
        findPath(menuItems[0].items);
        return openKeys;
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col justify-between">
            <AntdMenu
                mode="inline"
                inlineCollapsed={collapsed}
                theme="light"
                selectedKeys={[pathname]}
                defaultOpenKeys={getDefaultOpenKeys()}
                items={antdMenuItems}
                style={{ borderRight: 0 }}
            />

            {/* Logout Button */}
            {isAuthenticated && (
                <div className="p-2">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-3 rounded-lg transition text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <MdLogout className="w-5 h-5 min-w-[20px]" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Menu;