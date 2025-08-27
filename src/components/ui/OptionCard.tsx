'use client';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface OptionCardProps {
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
}

const OptionCard: React.FC<OptionCardProps> = ({ title, description, isSelected, onClick, icon }) => {
    const borderColor = isSelected ? 'border-accent-purple' : 'border-light-border';
    const ringColor = isSelected ? 'ring-2 ring-accent-purple/50' : '';

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-accent-purple/50 ${borderColor} ${ringColor}`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    {icon && <div className="mb-2 text-text-secondary">{icon}</div>}
                    <h3 className="font-semibold text-text-primary">{title}</h3>
                    <p className="text-sm text-text-secondary">{description}</p>
                </div>
                {isSelected && (
                    <FaCheckCircle className="text-accent-purple text-xl ml-2" />
                )}
            </div>
        </div>
    );
};

export default OptionCard;