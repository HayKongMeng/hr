import React from 'react';

interface LegendItemProps {
    colorClass: string; // Tailwind color class, e.g., 'bg-green-500'
    label: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ colorClass, label }) => {
    return (
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
            <span className="text-gray-700 text-sm">{label}</span>
        </div>
    );
};

const Legend: React.FC = () => {
    return (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 px-4">
            <LegendItem colorClass="bg-green-500" label="Present" />
            <LegendItem colorClass="bg-red-500" label="Absence" />
            <LegendItem colorClass="bg-blue-500" label="Holiday" />
            <LegendItem colorClass="bg-purple-500" label="Week Off" />
        </div>
    );
};

export default Legend;