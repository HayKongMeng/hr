'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import UserDropdown from './UserDropdown';
import { CiMenuBurger } from 'react-icons/ci';
import { Button } from 'antd';
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { RiMenuUnfold2Fill } from 'react-icons/ri';

interface NavbarProps {
    toggleCollapsed: () => void;
    collapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleCollapsed, collapsed }) => {
    const [rotated, setRotated] = useState(false);

    const handleClick = () => {
        setRotated((prev) => !prev);
        // toggleMenu();
    };

    return (
        <div className="flex items-center justify-between p-4 border-b md:border-b-0 z-10 relative">
            <div className="flex items-center">
                <Button
                    className="hidden md:block mr-2"
                    type="text"
                    icon={collapsed ? <AiOutlineMenuUnfold /> : <RiMenuUnfold2Fill />}
                    onClick={toggleCollapsed} 
                />

                <UserDropdown />
            </div>

            <div className="flex items-center gap-6 justify-end w-full pr-1">
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
                    <Image src="/message.png" alt="" width={20} height={20} />
                </div>
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                    <Image src="/announcement.png" alt="" width={20} height={20} />
                    <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
                        1
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;