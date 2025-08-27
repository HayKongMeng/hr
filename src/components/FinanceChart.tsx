"use client";

import Image from "next/image";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Mock data (can stay the same for now)
const data = [
    { name: "Jan", income: 4000, expense: 2400 },
    { name: "Feb", income: 3000, expense: 1398 },
    { name: "Mar", income: 2000, expense: 9800 },
    { name: "Apr", income: 2780, expense: 3908 },
    { name: "May", income: 1890, expense: 4800 },
    { name: "Jun", income: 2390, expense: 3800 },
    { name: "Jul", income: 3490, expense: 4300 },
    { name: "Aug", income: 3490, expense: 4300 },
    { name: "Sep", income: 3490, expense: 4300 },
    { name: "Oct", income: 3490, expense: 4300 },
    { name: "Nov", income: 3490, expense: 4300 },
    { name: "Dec", income: 3490, expense: 4300 },
];

const FinanceChart = () => {
    return (
        // --- UPDATED: Use the new card styles ---
        <div className="bg-light-card border border-light-border rounded-xl shadow-sm w-full h-full p-4 flex flex-col">
            {/* --- Header Section --- */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold text-text-primary">Financial Overview</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>

            {/* --- Chart Section (takes up remaining space) --- */}
            <div className="flex-grow mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 20, // Adjusted margins for better spacing
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        {/* --- UPDATED: Use theme colors --- */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAEBF1" /> {/* light-border */}
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tick={{ fill: "#718096" }} // text-secondary
                            tickLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            axisLine={false}
                            tick={{ fill: "#718096" }} // text-secondary
                            tickLine={false}
                            tickMargin={10}
                            // Format Y-axis ticks to be more readable (e.g., 2k, 4k)
                            tickFormatter={(value) => `$${(value / 1000)}k`}
                        />
                        <Tooltip
                            cursor={{ stroke: '#EAEBF1', strokeWidth: 1 }} // light-border on hover
                            contentStyle={{
                                background: '#FFFFFF',
                                border: '1px solid #EAEBF1',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '8px 12px'
                            }}
                            itemStyle={{ fontWeight: '600' }}
                        />
                        <Legend
                            align="right"
                            verticalAlign="top"
                            wrapperStyle={{ top: '-10px', right: '0' }}
                            iconType="circle"
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#4A3AFF" // accent-purple
                            strokeWidth={3}
                            dot={false} // Cleaner look without dots on the line
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#FAE27C" // accent-yellow
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FinanceChart;