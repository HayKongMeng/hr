'use client';

import Image from 'next/image';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

// --- NEW: Define a more structured data prop ---
interface UserCardData {
    type: string;
    count: number;
    chartData?: { value: number }[];
    percentageChange?: number;
}

const UserCard = ({ data }: { data: UserCardData }) => {
    const isPositive = data.percentageChange !== undefined && data.percentageChange >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    const strokeColor = isPositive ? '#22c55e' : '#ef4444'; // Green or Red hex

    return (
        <div className='bg-light-card border border-light-border rounded-2xl p-4 shadow-sm flex flex-col justify-between'>
            <div className='flex justify-between items-center'>
                <h2 className='uppercase text-xs font-bold text-text-secondary tracking-wider'>{data.type}</h2>
                <Image src="/moreDark.png" alt='' width={20} height={20} />
            </div>

            <div className="flex items-end justify-between my-2">
                <div>
                    <h1 className='text-3xl font-bold text-text-primary'>{data.count ?? '...'}</h1>
                    {data.percentageChange !== undefined && (
                        <p className={`text-sm font-semibold ${colorClass}`}>
                            {isPositive ? '+' : ''}{data.percentageChange.toFixed(2)}%
                        </p>
                    )}
                </div>

                {data.chartData && (
                    <div className="w-24 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={`color-${isPositive ? 'green' : 'red'}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    cursor={{ stroke: 'var(--color-text-secondary)', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    contentStyle={{
                                        background: '#FFFFFF',
                                        border: '1px solid #EAEBF1',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        padding: '4px 8px'
                                    }}
                                    itemStyle={{ color: strokeColor }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={strokeColor}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#color-${isPositive ? 'green' : 'red'})`}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserCard;