"use client"
import Image from 'next/image';
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface CountChartProps {
    genderData: {
        male: number;
        female: number;
        percentages: {
            male: number;
            female: number;
        }
    };
    totalEmployees: number;
}

const CountChart = ({ genderData, totalEmployees }: CountChartProps) => {

    // --- SOLUTION: Add a guard clause here ---
    // If genderData is not yet available, render a loading state or nothing at all.
    // This prevents the component from crashing.
    if (!genderData) {
        return (
            <div className='bg-white rounded-xl w-full h-full p-4 flex justify-center items-center'>
                <p className="text-gray-400">Loading chart data...</p>
            </div>
        );
    }

    const data = [
        { name: 'Female', count: genderData.female, fill: '#FAE27C' }, // accent-yellow
        { name: 'Male', count: genderData.male, fill: '#C3EBFA' },     // accent-skyblue
    ];

    return (
        <div className='bg-light-card border border-light-border rounded-xl shadow-sm w-full h-full p-4 flex flex-col'>
            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-lg font-semibold text-text-primary'>Employees ({totalEmployees})</h1>
                <Image src="/moreDark.png" alt='' width={20} height={20} />
            </div>
            <div className='relative w-full flex-grow'>
                <ResponsiveContainer>
                    <RadialBarChart
                        cx="50%" cy="50%" innerRadius="40%" outerRadius="100%"
                        barSize={32} data={data} startAngle={90} endAngle={-270}
                    >
                        {/* Use a light grey for the background track */}
                        <RadialBar background={{ fill: '#fae27c' }} dataKey="count" cornerRadius={10} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <Image src="/maleFemale.png" alt='' width={50} height={50} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div className='flex justify-center gap-12 mt-4'>
                <div className='flex flex-col gap-1 items-center'>
                    <div className='w-4 h-4 bg-accent-skyblue rounded-full' />
                    <h1 className='font-bold text-text-primary'>{genderData.male}</h1>
                    <h2 className='text-xs text-text-secondary'>Male ({genderData.percentages.male}%)</h2>
                </div>
                <div className='flex flex-col gap-1 items-center'>
                    <div className='w-4 h-4 bg-accent-yellow rounded-full' />
                    <h1 className='font-bold text-text-primary'>{genderData.female}</h1>
                    <h2 className='text-xs text-text-secondary'>Female ({genderData.percentages.female}%)</h2>
                </div>
            </div>
        </div>
    )
}

export default CountChart;