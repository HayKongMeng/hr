'use client';

import React from 'react';
import Image from 'next/image';
import { Button, Input, Badge } from 'antd'; // Import Input and Badge
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { RiMenuUnfoldFill } from 'react-icons/ri'; // A filled icon for consistency
import { CiSearch } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiSettings } from "react-icons/fi";

import UserDropdown from './UserDropdown';

interface NavbarProps {
    toggleCollapsed: () => void;
    collapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleCollapsed, collapsed }) => {

    return (
        // --- UPDATED: Main container with padding and border ---
        <div className="flex items-center justify-between bg-light-card p-3 border-b border-light-border shadow-sm">

            {/* --- Left Section: Logo (optional) and Menu Toggle --- */}
            <div className="flex items-center gap-4">
                {/* You could add your logo here if you have one */}
                {/* <Image src="/logo.svg" alt="Logo" width={120} height={30} /> */}

                <Button
                    className="hidden md:flex items-center justify-center text-text-secondary hover:text-text-primary"
                    type="text"
                    icon={collapsed ? <AiOutlineMenuUnfold size={20} /> : <RiMenuUnfoldFill size={20} />}
                    onClick={toggleCollapsed}
                />
                <UserDropdown />

            </div>

            {/* --- Right Section: Search, Actions, and User --- */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Badge count={2} size="small">
                        <Button
                            type="text"
                            shape="circle"
                            className="flex items-center justify-center text-text-secondary hover:text-text-primary"
                            icon={<IoMdNotificationsOutline size={22} />}
                        />
                    </Badge>

                    <Button
                        type="text"
                        shape="circle"
                        className="flex items-center justify-center text-text-secondary hover:text-text-primary"
                        icon={<FiSettings size={20} />}
                    />
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-light-border mx-2 hidden md:block"></div>

                {/* User Dropdown */}
            </div>
        </div>
    );
};

export default Navbar;