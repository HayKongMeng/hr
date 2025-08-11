import React from 'react';
import { IconType } from 'react-icons';
import { IoIosArrowForward } from 'react-icons/io';

interface ProfileMenuItemProps {
    Icon: IconType;
    title: string;
    onClick: () => void;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ Icon, title, onClick }) => {
    return (
        <button
            className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
            onClick={onClick}
        >
            <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-200 to-blue-300 p-2 mr-4 text-blue-800 shadow-inner">
                    <Icon className="w-full h-full" />
                </div>
                <span className="text-gray-800 text-base font-medium">
                    {title}
                </span>
            </div>
            <IoIosArrowForward className="text-gray-400 text-xl" />
        </button>
    );
};

export default ProfileMenuItem;