import React from 'react'
import { PiSealCheckThin } from "react-icons/pi";
import { PiSealCheck } from "react-icons/pi";
import { AiOutlineLogin } from "react-icons/ai";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface AttendanceData {
    presents: number;
    absents: number;
    leave: number;
}

interface AttendancePieChartProps {
    data: AttendanceData;
}

const COLORS = ['#60A5FA', '#F87171', '#FBBF24'];

const Overview: React.FC<AttendancePieChartProps> = ({ data }) => {
    const pieData = [
        { name: 'Presents', value: data.presents, color: 'bg-blue-400' },
        { name: 'Absents', value: data.absents, color: 'bg-red-400' },
        { name: 'Leave', value: data.leave, color: 'bg-yellow-400' },
    ];
    return (
        <div>
            <section className="mt-4 bshadow p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Overview</h2>
                    <span className="text-sm text-green-500">Today</span>
                </div>
                <div className="flex mt-3">
                    {/* Left: Pie Chart Section */}
                    <div className="w-2/4 bg-[#392648] rounded-[24px] flex flex-col p-4" style={{ height: '235px' }}>
                        <div className="w-full h-48">
                            <ResponsiveContainer>
                                <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={50}
                                    fill="#8884d8"
                                    label={false}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="text-sm mt-2 px-4">
                            {pieData.map((item, index) => (
                                <div key={index} className="flex items-center mb-1 text-white">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${item.color}`}></span>
                                    <span className='text-xs text-gray-400'>
                                        {item.name} {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Check In / Out Section */}
                    <div className="w-2/4 flex flex-col gap-4 pl-4" style={{ height: '235px' }}>
                        <div className="flex-1 p-4 bg-[#392648] rounded-[24px] text-white flex flex-col">
                            <div className="flex items-center">
                                <PiSealCheck className="w-6 h-6 mr-2" />
                                <span className="text-sm">Check in at</span>
                            </div>
                            <div className="mt-2 text-sm">8:00 am</div>
                            <div className="mt-2 text-xs text-gray-400">On Time</div>
                        </div>
                        <div className="flex-1 p-4 bg-[#392648] rounded-[24px] text-white flex flex-col">
                            <div className="flex items-center">
                                <AiOutlineLogin className="w-6 h-6 mr-2" />
                                <span className="text-sm">Check out at</span>
                            </div>
                            <div className="mt-2 text-sm">5:30 am</div>
                            <div className="mt-2 text-xs text-gray-400">Leave early</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Overview;
