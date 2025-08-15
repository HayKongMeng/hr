'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RxDashboard } from "react-icons/rx";
import { LuUsers, LuSettings } from "react-icons/lu";
import { TbPoint } from "react-icons/tb";
import { RiArrowDropDownLine } from "react-icons/ri";
import { LuServerCog } from "react-icons/lu";
import { LuUserCog } from "react-icons/lu";
import { FiUserPlus } from "react-icons/fi";
import {
  MdAccessTime,
  MdLogout,
  MdOutlineSpaceDashboard,
} from 'react-icons/md';

import type { IconType } from 'react-icons';
import { Spin } from 'antd';


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

const Menu = () => {
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

    const toggleDropdown = (key: string) => {
        setOpenDropdowns((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };
    
    const renderMenuItems = (
        items: (MenuItem | MenuChildItem)[],
        parentKey = ''
    ) => {
        return items.map((item) => {
            if (!role || !item.visible.includes(role)) {
                return null;
            }

            const key = parentKey ? `${parentKey} > ${item.label}` : item.label;
            const isDropdown = !!item.children?.length;
            const isOpen = openDropdowns.includes(key);
            const isActive = item.href && pathname === item.href;

        if (isDropdown) {
            return (
                <div key={key}>
                    <button
                        onClick={() => toggleDropdown(key)}
                        className="flex w-full items-center justify-between px-3 py-3.5 text-left rounded-lg hover:bg-gray-100 transition"
                    >
                        <div className="flex items-center gap-3">
                            {item.iconComponent &&
                            React.createElement(item.iconComponent, {
                                className: 'w-5 h-5 min-w-[20px] min-h-[20px] text-gray-600',
                            })}
                            <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <RiArrowDropDownLine
                            size={24}
                            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div
                        className={`ml-4 overflow-hidden transition-all duration-300 ${
                            isOpen ? 'max-h-[1000px] mt-1' : 'max-h-0'
                        }`}
                    >
                        <div className="pl-2 border-l border-gray-200 text-xs">
                            {renderMenuItems(item.children!, key)}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Link
                key={key}
                href={item.href || '#'}
              
                className={`flex items-center gap-3 px-3 py-3.5 rounded-lg transition text-sm font-medium ${
                    isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                {item.iconComponent &&
                    React.createElement(item.iconComponent, {
                        className: isActive ? 'w-5 h-5 min-w-[20px] min-h-[20px] text-orange-600' : 'w-5 h-5 min-w-[20px] min-h-[20px] text-gray-600',
                    })}
                <span className='text-sm'>{item.label}</span>
            </Link>
        );
        });
    };

    return (
        <div className="min-h-screen overflow-y-auto pr-2">
            <nav className="mt-2 text-sm text-gray-800 space-y-6">
                {menuItems.map((section, index) => (
                    <div key={index}>
                        <div className="space-y-1">{renderMenuItems(section.items)}</div>
                    </div>
                ))}
            </nav>
            {role && (
                <div className="mt-6 px-3">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-3.5 rounded-lg transition text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <MdLogout className="w-5 h-5 min-w-[20px] min-h-[20px]" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Menu;
