'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RxDashboard } from "react-icons/rx";
import { LuUsers, LuSettings } from "react-icons/lu";
import { TbPoint } from "react-icons/tb";
import { LuUserCog } from "react-icons/lu";
import { FiUserPlus } from "react-icons/fi";
import {
  MdAccessTime,
  MdLogout,
  MdOutlineSpaceDashboard,
} from 'react-icons/md';

import { Menu as AntdMenu } from 'antd';
import type { IconType } from 'react-icons';
import { MenuItemType } from 'antd/es/menu/interface';


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

const menuItems: MenuSection[] = [
    {
        items: [
            {
                iconComponent: RxDashboard,
                label: "Dashboard",
                visible: ["Admin", "Super Admin","Employee"],
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
                            {
                                iconComponent: TbPoint,
                                label: "Timesheet",
                                visible: ["Admin", "Super Admin"],
                            },
                        ],
                    },
                ]
            },
            {
                iconComponent: RxDashboard,
                label: "Dashboards",
                href: "/dashboard/dash",
                visible: ["Admin", "Super Admin"],
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
                        visible: ["Admin", "Super Admin"],
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
                iconComponent: FiUserPlus,
                label: "Entitlements",
                href: "/dashboard/list/entitlements",
                visible: ["Admin", "Super Admin","Employee"],
            },
            {
                iconComponent: MdAccessTime,
                label: "Timesheet",
                visible: ["Admin", "Super Admin", "Employee"],
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
                iconComponent: LuUserCog,
                label: "HR Admin Setup",
                visible: ["Admin" ],
                children: [
                    {
                        iconComponent: TbPoint,
                        label: "Holidays",
                        href: "/dashboard/list/holidays",
                        visible: ["Admin"],
                    }
                ],
            },
            {
                iconComponent: MdOutlineSpaceDashboard,
                label: "HRM System Setup",
                visible: ["Admin"],
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
            {
                iconComponent: LuSettings,
                label: "System Setting",
                href: "/settings",
                visible: ["Admin", "Employee"],
            },
        ],
    },
];


const Menu: React.FC<MenuProps> = ({ closeMenu, collapsed }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(localStorage.getItem('user_role'));
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            toast.success('Logged out successfully!');
            router.push('/sign-in');
        } catch (error: any) {
            toast.error('Logout failed. Try again.');
        }
    };

    const transformMenuItems = (items: (MenuItem | MenuChildItem)[], userRole: string): MenuItemType[] => {
        return items
            .filter(item => item.visible.includes(userRole))
            .map((item) => {
                const key = item.href || item.label;
                const icon = item.iconComponent ? React.createElement(item.iconComponent) : null;

                if (item.children && item.children.length > 0) {
                    return {
                        key: key,
                        icon: icon,
                        label: item.label,
                        children: transformMenuItems(item.children, userRole),
                    } as MenuItemType;
                }

                return {
                    key: key,
                    icon: icon,
                    label: (
                        <Link href={item.href || '#'} onClick={closeMenu}>
                            {item.label}
                        </Link>
                    ),
                } as MenuItemType;
            });
    };

    const antdMenuItems = role ? transformMenuItems(menuItems[0].items, role) : [];
    
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
            {role && (
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