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
        <div className="flex items-center justify-between bg-light-card p-3 border-b border-light-border shadow-sm">

            <div className="flex items-center gap-4">

                <Button
                    className="hidden md:flex items-center justify-center text-text-secondary hover:text-text-primary"
                    type="text"
                    icon={collapsed ? <AiOutlineMenuUnfold size={20} /> : <RiMenuUnfoldFill size={20} />}
                    onClick={toggleCollapsed}
                />
                <UserDropdown />

            </div>

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

                {/*<div className="w-px h-8 bg-light-border mx-2 hidden md:block"></div>*/}

            </div>
        </div>
    );
};

export default Navbar;