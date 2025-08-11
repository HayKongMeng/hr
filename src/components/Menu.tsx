'use client';

import React, { useState } from 'react';
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
import { TbUserSquareRounded } from "react-icons/tb";
import {
  MdAccessTime,
  MdLogout,
  MdOutlineSpaceDashboard,
} from 'react-icons/md';

import type { IconType } from 'react-icons';

const role = 'admin';

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
                visible: ["admin", "teacher", "student", "parent"],
                children: [
                    {
                        iconComponent: TbPoint,
                        label: "Overview",
                        href: "/dashboard/admin",
                        visible: ["admin", "teacher"],
                    },
                    {
                        iconComponent: TbPoint,
                        label: "Report",
                        visible: ["admin", "teacher"],
                        children: [
                            {
                                iconComponent: TbPoint,
                                label: "Monthly Attendance",
                                href: "/dashboard/list/report/monthly/attendance",
                                visible: ["admin", "teacher"],
                            },
                            {
                                iconComponent: TbPoint,
                                label: "Leave",
                                href: "/dashboard/list/report/leave",
                                visible: ["admin", "teacher"],
                            },
                            {
                                iconComponent: TbPoint,
                                label: "Timesheet",
                                visible: ["admin", "teacher"],
                            },
                        ],
                    },
                ]
            },
            {
                iconComponent: RxDashboard,
                label: "Dashboards",
                href: "/dashboard/dash",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                iconComponent: LuServerCog,
                label: "Super Admin",
                visible: ["admin", "teacher"],
                children: [
                    {
                        iconComponent: TbPoint,
                        label: "Companies",
                        href: "/dashboard/list/companies",
                        visible: ["admin", "teacher", "student", "parent"],
                    }
                ],
            },
            {
                iconComponent: LuUsers,
                label: "Staff",
                visible: ["admin", "teacher"],
                children: [
                    {
                        iconComponent: TbPoint,
                        label: "User",
                        href: "/dashboard/list/users",
                        visible: ["admin", "teacher"],
                    },
                    {
                        iconComponent: TbPoint,
                        label: "Role",
                        href: "/dashboard/list/roles",
                        visible: ["admin", "teacher"],
                    },
                    // {
                    //     iconComponent: TbPoint,
                    //     label: "Employee Profile",
                    //     href: "/dashboard/list/roles",
                    //     visible: ["admin", "teacher"],
                    // },
                ],
            },
            {
                iconComponent: FiUserPlus,
                label: "Employee",
                href: "/dashboard/list/employees",
                visible: ["admin", "teacher"],
            },
            {
                iconComponent: FiUserPlus,
                label: "Entitlements",
                href: "/dashboard/list/entitlements",
                visible: ["admin", "teacher"],
            },
            {
                iconComponent: MdAccessTime,
                label: "Timesheet",
                visible: ["admin", "teacher"],
                children: [
                    {
                        iconComponent: TbPoint,
                        label: "Timesheet",
                        href: "/dashboard/list/users",
                        visible: ["admin", "teacher"],
                    },
                    {
                        iconComponent: TbPoint,
                        label: "Manage Leave",
                        href: "/dashboard/list/leaves",
                        visible: ["admin", "teacher"],
                    },
                    {
                        iconComponent: TbPoint,
                        label: "Attendance",
                        visible: ["admin", "teacher"],
                        children: [
                            {
                                iconComponent: TbPoint,
                                label: "Marked Attendance",
                                href: "/dashboard/list/attendance/markedattendance",
                                visible: ["admin", "teacher"],
                            }
                        ],
                    },
                ],
            },
            {
                iconComponent: LuUserCog,
                label: "HR Admin Setup",
                visible: ["admin", "teacher"],
                children: [
                    {
                        iconComponent: TbPoint,
                        label: "Holidays",
                        href: "/dashboard/list/holidays",
                        visible: ["admin", "teacher"],
                    }
                ],
            },
            {
                iconComponent: MdOutlineSpaceDashboard,
                label: "HRM System Setup",
                visible: ["admin", "teacher"],
                children: [
                    {
                        iconComponent: TbPoint,
                        label: "Department",
                        href: "/dashboard/list/departments",
                        visible: ["admin", "teacher"],
                    },
                    {
                        iconComponent: TbPoint,
                        label: "Designation",
                        href: "/dashboard/list/designations",
                        visible: ["admin", "teacher"],
                    },
                    {
                        iconComponent: TbPoint,
                        label: "Leave Type",
                        href: "/dashboard/list/leave-type",
                        visible: ["admin", "teacher"],
                    }
                ],
            },
            {
                iconComponent: LuSettings,
                label: "System Setting",
                href: "/settings",
                visible: ["admin", "teacher", "student", "parent"],
            },
        ],
    },
];

const Menu = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

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
            if (!item.visible.includes(role)) return null;

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
        </div>
    );
};

export default Menu;
