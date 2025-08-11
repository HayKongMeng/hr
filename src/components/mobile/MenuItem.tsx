import React from 'react';
import { IconType } from 'react-icons';

interface MenuItemProps {
    Icon: IconType;
    label: string;
    onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ Icon, label, onClick }) => {
    return (
        <button
            className="flex flex-col items-center justify-center p-4 card-table rounded-xl transition-shadow duration-200 cursor-pointer"
            onClick={onClick}
        >
            <div className="text-blue-600 mb-2" style={{ fontSize: '1.5rem' }}> {/* Adjust size and color here */}
                <Icon />
            </div>
            <span className="text-gray-700 text-xs font-medium text-center">
                {label}
            </span>
        </button>
    );
};

export default MenuItem;