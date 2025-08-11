import React from 'react';

interface SummaryCardProps {
    value: string | number;
    label: string;
    circleBgColor: string; // Tailwind background color class for the circle
    circleTextColor: string; // Tailwind text color class for the circle
}

const SummaryCard: React.FC<SummaryCardProps> = ({ value, label, circleBgColor, circleTextColor }) => {
    return (
        <div className="flex items-center bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold mr-4 ${circleBgColor} ${circleTextColor}`}>
                {value}
            </div>
            <div className="flex-1">
                <p className="text-gray-800 text-sm font-semibold">{value} Days</p>
                <p className="text-gray-500 text-xs">{label}</p>
            </div>
        </div>
    );
};

export default SummaryCard;