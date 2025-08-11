"use client"
import { useState } from "react";
import { PiSealCheck } from "react-icons/pi";
import { AiOutlineLogin } from "react-icons/ai";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface AttendanceData {
    presents: number;
    absents: number;
    leave: number;
}

interface AttendancePieChartProps {
    data: AttendanceData;
    todayAttendance: {
        checkIn: string;
        checkInStatus: string;
        checkOut: string;
        checkOutStatus: string;
    }
}

const COLORS = ['#2d5bff', '#93aafd', '#c6d2fd'];

const OverviewHr: React.FC<AttendancePieChartProps> = ({ data, todayAttendance }) => {
    const pieData = [
        { name: 'Presents', value: data.presents, color: '#2d5bff' },
        { name: 'Absents', value: data.absents, color: '#93aafd' },
        { name: 'Leave', value: data.leave, color: '#c6d2fd' },
    ];
    const [selectedPeriod, setSelectedPeriod] = useState("Today");

    return (
        <div className="mt-4 bg-shadow p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-medium text-black tracking-tight">
                    Overview
                </h1>
                <div className="bg-white rounded-md shadow-sm border border-gray-100 px-3 py-2 flex items-center gap-2 min-w-[76px]">
                    <div className="w-5 h-5 flex-shrink-0">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                            d="M6.66667 1.66667V5M13.3333 1.66667V5M2.5 8.33333H17.5M4.16667 3.33333H15.8333C16.7538 3.33333 17.5 4.07953 17.5 5V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V5C2.5 4.07953 3.24619 3.33333 4.16667 3.33333Z"
                            stroke="#141414"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="text-sm text-[#141414] font-medium tracking-tight flex-1 text-center">
                        {selectedPeriod}
                    </span>
                    <div className="w-3 flex-shrink-0">
                        <svg
                            width="12"
                            height="8"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                            d="M1 1.5L6 6.5L11 1.5"
                            stroke="#141414"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-3">
                {/* Left Side - Chart and Legend */}
                <div className="bg-[#392648] rounded-3xl w-40 relative overflow-hidden">
                    <div className="w-full h-28">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} fill="#8884d8" label={false} labelLine={false}>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Pie Chart (positioned at top) */}
                    {/* <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-20">
                    <svg
                        width="80"
                        height="80"
                        viewBox="0 0 80 80"
                        className="transform -rotate-90"
                    >
                       
                        <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="10"
                        />

                      
                        <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#2d5bff"
                        strokeWidth="10"
                        strokeDasharray="110 220"
                        strokeDashoffset="0"
                        />

                        
                        <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#93aafd"
                        strokeWidth="10"
                        strokeDasharray="106 220"
                        strokeDashoffset="-110"
                        />

                       
                        <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#c6d2fd"
                        strokeWidth="10"
                        strokeDasharray="4 220"
                        strokeDashoffset="-216"
                        />
                    </svg>
                    </div> */}

                    {/* Legend */}
                    <div className="space-y-5 text-sm pr-4 pl-4">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                                <span className="text-white font-medium">{item.name}</span>
                                <span className="text-[#dedede] font-normal ml-auto">{item.value}</span>
                            </div>
                        ))} 
                    </div> 

                    {/* <div className="space-y-5 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#2d5bff] flex-shrink-0"></div>
                            <span className="text-white font-medium">Presents</span>
                            <span className="text-[#dedede] font-normal ml-auto">30</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#93aafd] flex-shrink-0"></div>
                            <span className="text-white font-medium">Absents</span>
                            <span className="text-[#dedede] font-normal ml-auto">29</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#c6d2fd] flex-shrink-0"></div>
                            <span className="text-white font-medium">Leave</span>
                            <span className="text-[#dedede] font-normal ml-auto">1</span>
                        </div>
                    </div> */}
                </div>

                {/* Right Side - Check in/out cards */}
                <div className="flex-1 space-y-3">
                    {/* Check in card */}
                    <div className="bg-[#392648] rounded-3xl p-4 h-28">
                        <div className="flex items-center gap-2 mb-3 text-white">
                            <div className="w-6 h-6 flex-shrink-0">
                                <PiSealCheck className="w-6 h-6 mr-2" />
                            </div>
                            <span className="text-[#dedede] text-sm font-medium">
                                Check in at
                            </span>
                        </div>
                        <div>
                            <div className="text-white text-base font-normal">{todayAttendance.checkIn}</div>
                            <div className="text-[#dedede] text-xs font-normal mt-1">
                                {todayAttendance.checkInStatus}
                            </div>
                        </div>
                    </div>

                    {/* Check out card */}
                    <div className="bg-[#392648] rounded-3xl p-4 h-28">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 flex-shrink-0 text-white">
                                <AiOutlineLogin className="w-6 h-6 mr-2" />
                            </div>
                            <span className="text-[#dedede] text-sm font-medium">
                            Check out at
                            </span>
                        </div>

                        <div>
                            <div className="text-white text-base font-normal">{todayAttendance.checkOut}</div>
                            <div className="text-[#dedede] text-xs font-normal mt-1">
                           {todayAttendance.checkOutStatus}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OverviewHr;