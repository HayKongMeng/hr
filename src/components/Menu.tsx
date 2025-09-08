'use client';

import React, { useEffect, useState, useMemo } from 'react'; // Import useMemo
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/lib/AuthContext";
import { Spin, Tooltip } from 'antd';
import type { IconType } from 'react-icons';
import clsx from 'clsx';
import {
    LuLayoutGrid,
    LuLayers,
    LuChevronDown,
} from 'react-icons/lu';
import { GiPartyFlags } from "react-icons/gi";
import { FiUserPlus } from "react-icons/fi";
import {FaRegBuilding, FaUserShield} from "react-icons/fa";
import { FaBuildingShield } from "react-icons/fa6";

interface NavItem {
    label: string;
    icon: IconType;
    href?: string;
    badge?: number | string;
    children?: NavItem[];
    visible: string[];
}

interface MenuSection {
    title?: string;
    items: NavItem[];
}

interface MenuProps {
    closeMenu: () => void;
    collapsed: boolean;
}

const Menu: React.FC<MenuProps> = ({ closeMenu, collapsed }) => {
    const pathname = usePathname();
    const { user, employee, loading: authLoading } = useAuth();

    const [openSections, setOpenSections] = useState<string[]>([]);

    const userRoles = user?.roles || [];
    const employeeId = employee?.data?.id;

    const getMenuItems = (empId: number | undefined): MenuSection[] => [
        {
            title: 'Dashboard Manage',
            items: [
                {
                    label: 'Dashboard',
                    icon: LuLayoutGrid,
                    visible: ['Admin', 'Super Admin', 'Employee'],
                    children: [
                        {
                            label: 'Dashboard',
                            href: '/dashboard/admin',
                            icon: LuLayoutGrid,
                            visible: ['Admin', 'Super Admin'],
                        },
                        {
                            label: 'Check In',
                            icon: LuLayoutGrid,
                            href: `/dashboard/dash`,
                            visible: ["Admin", "Employee"],
                        },
                        {
                            label: 'Attendance',
                            icon: LuLayoutGrid,
                            href: `/dashboard/list/attendance`,
                            visible: ["Admin", "Employee"],
                        },
                        {
                            label: 'Leave Request',
                            icon: LuLayoutGrid,
                            href: `/dashboard/list/leaves`,
                            visible: ["Admin", "Employee"],
                        },
                        {
                            label: 'My Profile',
                            icon: LuLayoutGrid,
                            href: `/dashboard/list/employees/${empId}`,
                            visible: ["Admin", "Employee"],
                        },
                    ],
                },
            ],
        },
        {
            title: 'HRMS Setup',
            items: [
                {
                    label: 'Employee Create',
                    icon: FiUserPlus,
                    visible: ['Admin', 'Super Admin'],
                    children: [
                        { label: 'Users', icon: LuLayers, href: '/dashboard/list/users', visible: ['Super Admin'] },
                        { label: 'Roles', icon: FaUserShield, href: '/dashboard/list/roles', visible: ["Super Admin"] },
                        { label: 'Employees', icon: FiUserPlus, href: '/dashboard/list/employees', visible: ["Admin", "Super Admin"] },
                    ],
                },
                {
                    label: 'Holidays Setup',
                    icon: GiPartyFlags,
                    visible: ['Admin', 'Super Admin'],
                    children: [
                        { label: 'Manage Leave', icon: LuLayers, href: '/dashboard/list/leaves', visible: ['Admin', 'Super Admin', 'Employee'] },
                        { label: 'Entitlement setup', icon: LuLayers, href: '/dashboard/list/entitlements', visible: ["Admin", "Super Admin"] },
                        { label: 'Nationalities setup', icon: LuLayers, href: '/dashboard/list/nationalities', visible: ["Admin", "Super Admin"] },
                        { label: 'Working station setup', icon: LuLayers, href: '/dashboard/list/working-station', visible: ["Admin", "Super Admin"] },
                        { label: 'Marital Status setup', icon: LuLayers, href: '/dashboard/list/marital-status', visible: ["Admin", "Super Admin"] },
                        { label: 'Leave type', icon: LuLayers, href: '/dashboard/list/leave-type', visible: ["Admin", "Super Admin"] },
                        { label: 'Designation setup', icon: LuLayers, href: '/dashboard/list/designations', visible: ["Admin", "Super Admin"] },
                    ],
                },
                {
                    label: 'Employee Field Setup',
                    icon: LuLayers,
                    visible: ['Admin', 'Super Admin'],
                    children: [
                        // Note: I've corrected this as 'Manage Leave' was duplicated.
                        { label: 'Holidays', icon: LuLayers, href: '/dashboard/list/holidays', visible: ["Admin"] },
                    ],
                },
                { label: 'Holidays', icon: GiPartyFlags, href: '/dashboard/list/holidays', visible: ["Employee"] },
                {
                    label: 'Company Setup',
                    icon: FaRegBuilding,
                    visible: ['Admin', 'Super Admin'],
                    children: [
                        { label: 'Company', icon: LuLayers, href: '/dashboard/list/companies', visible: ['Admin', 'Super Admin'] },
                        { label: 'Work Schedule', icon: LuLayers, href: '/dashboard/list/work-schedule', visible: ['Admin', 'Super Admin'] },
                    ],
                },
            ],
        },
    ];

    const menuSections = useMemo(() => {
        const rawSections = getMenuItems(employeeId);

        const processSections = (sections: MenuSection[], roles: string[]): MenuSection[] => {
            return sections.map(section => ({
                ...section,
                items: section.items.map(item => {
                    if (!item.children) {
                        return item;
                    }

                    const visibleChildren = item.children.filter(child =>
                        child.visible.some(role => roles.includes(role))
                    );

                    return {
                        ...item,
                        badge: visibleChildren.length,
                    };
                }),
            }));
        };

        return processSections(rawSections, userRoles);
    }, [employeeId, userRoles]);

    useEffect(() => {
        if (collapsed) {
            setOpenSections([]);
        }
    }, [collapsed]);

    useEffect(() => {
        if (!collapsed) {
            const activeParent = menuSections
                .flatMap(section => section.items)
                .find(item => item.children?.some(child => child.href === pathname));
            if (activeParent) {
                setOpenSections([activeParent.label]);
            }
        }
    }, [pathname, collapsed, menuSections]);

    const toggleSection = (label: string) => {
        if (collapsed) return;
        setOpenSections(prev =>
            prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
        );
    };

    if (authLoading) {
        return <div className="flex justify-center items-center h-full p-6"><Spin /></div>;
    }

    return (
        <nav className="flex-grow p-4">
            {menuSections.map((section, sectionIndex) => (
                <div key={section.title || sectionIndex}>
                    {section.title && (
                        <h2 className={clsx("px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider", {
                            'opacity-0': collapsed,
                            'opacity-100': !collapsed
                        })}>
                            {section.title}
                        </h2>
                    )}
                    <ul className="space-y-1">
                        {section.items
                            .filter(item => item.visible.some(role => userRoles.includes(role)))
                            .map((item) => (
                                <li key={item.label}>
                                    <Tooltip title={item.label} placement="right" mouseEnterDelay={0.3} open={collapsed ? undefined : false}>
                                        <div>
                                            {item.children ? (
                                                <>
                                                    <div
                                                        onClick={() => toggleSection(item.label)}
                                                        className={clsx("flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100", {
                                                            'justify-center': collapsed
                                                        })}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className="text-gray-700 min-w-[20px]" size={20} />
                                                            {!collapsed && <span className="font-medium text-sm text-gray-800">{item.label}</span>}
                                                        </div>
                                                        {!collapsed && (
                                                            <div className="flex items-center gap-2">
                                                                {/* *** CHANGE: Only render badge if count > 0 *** */}
                                                                {/*{item.badge && Number(item.badge) > 0 && (*/}
                                                                {/*    <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-200 rounded-md">*/}
                                                                {/*        {item.badge}*/}
                                                                {/*    </span>*/}
                                                                {/*)}*/}
                                                                <LuChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${openSections.includes(item.label) ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!collapsed && openSections.includes(item.label) && (
                                                        <ul className="mt-1 pl-7 border-l border-gray-200 ml-4">
                                                            {item.children
                                                                .filter(child => child.visible.some(role => userRoles.includes(role)))
                                                                .map(child => (
                                                                    <li key={child.label}>
                                                                        <Link href={child.href || '#'} onClick={closeMenu} className={`block p-2 rounded-md text-sm transition-colors ${pathname === child.href ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-black'}`}>
                                                                            {child.label}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    )}
                                                </>
                                            ) : (
                                                <Link href={item.href || '#'} onClick={closeMenu} className={clsx("flex items-center gap-3 p-3 rounded-lg transition-colors", {
                                                    'justify-center': collapsed,
                                                    'bg-gray-100 text-black font-semibold': pathname === item.href,
                                                    'text-gray-600 hover:bg-gray-100 hover:text-black': pathname !== item.href
                                                })}>
                                                    <item.icon size={20} className="min-w-[20px]" />
                                                    {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                                                </Link>
                                            )}
                                        </div>
                                    </Tooltip>
                                </li>
                            ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
};

export default Menu;