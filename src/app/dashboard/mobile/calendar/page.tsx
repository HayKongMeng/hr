"use client";

import Legend from '@/components/mobile/Legend';
import SummaryCard from '@/components/mobile/SummaryCard';
import React, { useState } from 'react';
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];



const Calendar = () => {
    const [value, onChange] = useState<Value>(new Date());
    return (
        <div className="min-h-screen w-full absolute -mt-[27px] z-20 bg-white rounded-t-[15px] overflow-y-auto max-h-[calc(100vh-62px)]">
            <main className="p-4 pt-6 space-y-6 relative z-20 pb-52">
                <div className='card-table rounded-xl p-4'>
                    <ReactCalendar onChange={onChange} value={value} />
                </div>
                <Legend />
                <div className="space-y-4 p-4">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Attendance summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <SummaryCard
                            value="31"
                            label="Total Working Days"
                            circleBgColor="bg-indigo-600"
                            circleTextColor="text-white"
                        />
                        <SummaryCard
                            value="30"
                            label="Present"
                            circleBgColor="bg-green-600"
                            circleTextColor="text-white"
                        />
                        <SummaryCard
                            value="01"
                            label="Absence"
                            circleBgColor="bg-red-600"
                            circleTextColor="text-white"
                        />
                        <SummaryCard
                            value="02"
                            label="Holiday"
                            circleBgColor="bg-blue-600"
                            circleTextColor="text-white"
                        />
                        {/* Add more cards as needed */}
                        <SummaryCard
                            value="02"
                            label="Late Arrival"
                            circleBgColor="bg-purple-600"
                            circleTextColor="text-white"
                        />
                        <SummaryCard
                            value="01"
                            label="Early Departure"
                            circleBgColor="bg-orange-600"
                            circleTextColor="text-white"
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Calendar;
