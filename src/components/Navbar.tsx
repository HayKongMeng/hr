'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import UserDropdown from './UserDropdown';
import { CiMenuBurger } from 'react-icons/ci';

interface NavbarProps {
    toggleMenu: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleMenu }) => {
    const [rotated, setRotated] = useState(false);

    const handleClick = () => {
        setRotated((prev) => !prev);
        toggleMenu();
    };

    return (
        <div className="flex items-center justify-between p-4 border-b md:border-b-0 z-10 relative">
            <div className="flex items-center">
                <button className="w-10 h-10 mr-2 items-center justify-center rounded-lg border ring-gray-300 text-xs p-2 block md:hidden">
                    <CiMenuBurger
                        className={`w-5 h-5 transition-transform duration-300 ${
                            rotated ? 'rotate-90' : 'rotate-0'
                        }`}
                        onClick={handleClick}
                    />
                </button>

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